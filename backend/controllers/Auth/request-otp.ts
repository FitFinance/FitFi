import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import User from '../../models/UserModel.js';
import getRedisClient from '../../services/redis/index.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import { ethers } from 'ethers';

// Env: ETH_RPC_URL, SIGNUP_CONTRACT_ADDRESS, OTP_TTL_SECONDS, ADMIN_PRIVATE_KEY

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

  // Check if user exists
  const existing: IUser | null = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
  });
  if (existing) {
    return sendResponse(res, {
      message: 'User exists. Proceed to login with nonce signature flow.',
      details: { title: 'User Exists', description: '' },
      status: 'success',
      statusCode: 200,
      success: true,
      data: { exists: true },
    });
  }

  // Create OTP
  const otp: string = generateNDigitRandomNumber(6).toString().padStart(6, '0');
  const ttlSec: number = Number(process.env.OTP_TTL_SECONDS || 300);
  const expiry: number = Math.floor(Date.now() / 1000) + ttlSec;
  const otpId: number = Date.now();

  // Emit OTP via contract event (admin-only)
  const rpcUrl: string | undefined = process.env.ETH_RPC_URL;
  const contractAddr: string | undefined = process.env.SIGNUP_CONTRACT_ADDRESS;
  const adminKey: string | undefined = process.env.ADMIN_PRIVATE_KEY;

  if (!rpcUrl || !contractAddr || !adminKey) {
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

  const abi: string[] = [
    'function issueOtp(address user, string otp, uint64 expiry, uint256 otpId) external',
  ];

  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet: ethers.Wallet = new ethers.Wallet(adminKey!, provider);
  const contract: ethers.Contract = new ethers.Contract(
    contractAddr!,
    abi,
    wallet
  );

  const tx: ethers.TransactionResponse = await contract.issueOtp(
    walletAddress,
    otp,
    expiry,
    otpId
  );
  const receipt: ethers.TransactionReceipt | null = await tx.wait();

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

  return sendResponse(res, {
    message: 'OTP issued via contract event',
    details: {
      title: 'OTP Sent',
      description: 'Check your wallet activity/events',
    },
    status: 'success',
    statusCode: 200,
    success: true,
    data: { otpId, txHash: receipt?.hash },
  });
});

export default requestOtp;
