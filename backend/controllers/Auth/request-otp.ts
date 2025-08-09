import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import User from '../../models/UserModel.js';
import getRedisClient from '../../services/redis/index.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import { ethers } from 'ethers';

// Env: ETH_RPC_URL, SIGNUP_CONTRACT_ADDRESS, OTP_TTL_SECONDS, ADMIN_PRIVATE_KEY
// Optional: OTP_DELIVERY_MODE = 'contract' | 'tx' | 'both' (default: 'contract')

const requestOtp: fn = catchAsync(async (req: Request, res: Response) => {
  const walletAddress: string | undefined = req.body.walletAddress;
  if (!walletAddress) {
    return sendResponse(res, {
      message: 'Wallet address is required.',
      details: { title: 'Missing Wallet Address', description: '' },
      status: 'fail',
      statusCode: 400,
      success: false,
    });
  }

  // Check if user exists (we'll still issue OTP regardless)
  const existing: IUser | null = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
  });
  const exists: boolean = !!existing;

  // Create OTP
  const otp: string = generateNDigitRandomNumber(6).toString().padStart(6, '0');
  const ttlSec: number = Number(process.env.OTP_TTL_SECONDS || 300);
  const expiry: number = Math.floor(Date.now() / 1000) + ttlSec;
  const otpId: number = Date.now();

  // Emit OTP via contract event (admin-only)
  const rpcUrl: string | undefined = process.env.ETH_RPC_URL;
  const contractAddr: string | undefined = process.env.SIGNUP_CONTRACT_ADDRESS;
  const adminKeyRaw: string | undefined = process.env.ADMIN_PRIVATE_KEY;
  const deliveryMode: string = (
    process.env.OTP_DELIVERY_MODE || 'contract'
  ).toLowerCase();

  if (!rpcUrl || !contractAddr || !adminKeyRaw) {
    return sendResponse(res, {
      message: 'Server is not configured for OTP contract.',
      details: {
        title: 'Config Error',
        description: 'Missing ETH RPC or contract address or admin key',
      },
      status: 'error',
      statusCode: 500,
      success: false,
    });
  }

  // Normalize and validate admin private key (must be 32-byte hex, not an address)
  const adminKey: string = adminKeyRaw.startsWith('0x')
    ? adminKeyRaw
    : `0x${adminKeyRaw}`;
  const isAddressLike: boolean = /^0x[0-9a-fA-F]{40}$/.test(adminKey);
  const isPrivateKeyLike: boolean = /^0x[0-9a-fA-F]{64}$/.test(adminKey);
  if (isAddressLike || !isPrivateKeyLike) {
    return sendResponse(res, {
      message:
        'Invalid ADMIN_PRIVATE_KEY format. Provide a 32-byte hex private key with 0x prefix.',
      details: {
        title: 'Invalid Admin Key',
        description:
          'It looks like an address was provided. Set ADMIN_PRIVATE_KEY to the private key (0x + 64 hex) that controls the FitFiSignup contract owner.',
      },
      status: 'fail',
      statusCode: 400,
      success: false,
    });
  }

  const abi: string[] = [
    'function owner() view returns (address)',
    'function issueOtp(address user, string otp, uint64 expiry, uint256 otpId) external',
    'function issueOtpWithPing(address user, string otp, uint64 expiry, uint256 otpId) external',
    'function issueOtpWithEncodedValue(address user, string otp, uint64 expiry, uint256 otpId) external',
    'function valueEncodingBase() view returns (uint256)',
  ];

  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet: ethers.Wallet = new ethers.Wallet(adminKey, provider);

  let contractTxHash: string | undefined;
  let dataTxHash: string | undefined;
  let valueEncodingTxHash: string | undefined;

  // Contract path: emit OTP via contract event (default behavior)
  const contractPing: boolean =
    String(process.env.OTP_CONTRACT_PING || 'false').toLowerCase() === 'true';
  if (deliveryMode === 'contract' || deliveryMode === 'both') {
    const contract: ethers.Contract = new ethers.Contract(
      contractAddr!,
      abi,
      wallet
    );

    // Ensure ADMIN_PRIVATE_KEY corresponds to the contract owner to avoid Ownable revert
    try {
      const currentOwner: string = await contract.owner();
      if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
        return sendResponse(res, {
          message: 'Admin key is not the owner of FitFiSignup contract.',
          details: {
            title: 'Ownership Mismatch',
            description:
              'The provided ADMIN_PRIVATE_KEY does not match the contract owner. Update ADMIN_PRIVATE_KEY or transfer ownership to this address.',
            context: {
              expectedOwner: currentOwner,
              providedAdmin: wallet.address,
            },
          },
          status: 'fail',
          statusCode: 403,
          success: false,
        });
      }
    } catch (err) {
      return sendResponse(res, {
        message: 'Failed to read contract owner. Check RPC/contract address.',
        details: { title: 'RPC/Contract Error', description: '' },
        status: 'error',
        statusCode: 500,
        success: false,
      });
    }

    let methodName: string = contractPing ? 'issueOtpWithPing' : 'issueOtp';
    const preferEncodedValue: boolean =
      String(
        process.env.OTP_VALUE_ENCODING_CALL_CONTRACT || 'false'
      ).toLowerCase() === 'true';
    if (preferEncodedValue) {
      methodName = 'issueOtpWithEncodedValue';
    }
    const tx: ethers.TransactionResponse = await (contract as any)[methodName](
      walletAddress,
      otp,
      expiry,
      otpId
    );
    await tx.wait();
    contractTxHash = tx.hash;
  }

  // Optional: send a zero-value admin transaction to user's EOA with OTP encoded in data
  if (deliveryMode === 'tx' || deliveryMode === 'both') {
    try {
      const payload: string = `OTP:${otp}|ID:${otpId}|EXP:${expiry}`;
      const dataHex: string = ethers.hexlify(ethers.toUtf8Bytes(payload));
      const dataTx: ethers.TransactionResponse = await wallet.sendTransaction({
        to: walletAddress,
        value: 0n,
        data: dataHex,
      });
      await dataTx.wait();
      dataTxHash = dataTx.hash;
    } catch (e) {
      console.error('Error sending OTP data tx:', e);
      // Do not fail the whole request; continue with other delivery path
    }
  }

  // Optional: encode OTP into the numeric value of a tiny ETH transfer for basic visibility in some wallet UIs
  // NOTE: MetaMask typically truncates after a few decimals; user may still need explorer for full digits.
  if (
    String(process.env.OTP_VALUE_ENCODING || 'false').toLowerCase() === 'true'
  ) {
    try {
      // Scale: 1e3 wei per unit -> max cost ~ (999999 * 1e3) wei = 0.000999999 ETH (acceptable testnet)
      const numericOtp: number = parseInt(otp, 10);
      const valueWei: bigint = BigInt(numericOtp) * 1000n; // otp * 1e3 wei
      // Ensure minimum dust of 1 gwei if result is zero (shouldn't happen unless otp 000000)
      const adjustedValueWei: bigint =
        valueWei === 0n ? 1_000_000_000n : valueWei; // 1 gwei fallback
      const valueTx: ethers.TransactionResponse = await wallet.sendTransaction({
        to: walletAddress,
        value: adjustedValueWei,
      });
      await valueTx.wait();
      valueEncodingTxHash = valueTx.hash;
    } catch (e) {
      console.error('Error sending value-encoded OTP tx:', e);
    }
  }

  // Store OTP in Redis with TTL
  const redis: any = await getRedisClient();
  const key: string = `otp:${walletAddress.toLowerCase()}`;
  const secondsToLive: number = Math.max(
    expiry - Math.floor(Date.now() / 1000),
    1
  );
  await redis.set(key, JSON.stringify({ otp, expiry, otpId }), {
    EX: secondsToLive,
  });

  const isDev: boolean = process.env.NODE_ENV === 'development';
  return sendResponse(res, {
    message: 'OTP issued via contract event',
    details: {
      title: 'OTP Sent',
      description: 'Check your wallet activity/events',
    },
    status: 'success',
    statusCode: 200,
    success: true,
    data: {
      exists,
      otpId,
      contractTxHash,
      dataTxHash,
      valueEncodingTxHash,
      ...(isDev ? { devOtp: otp } : {}),
    },
  });
});

export default requestOtp;
