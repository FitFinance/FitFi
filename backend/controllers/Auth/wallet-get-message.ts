import { Request, Response } from 'express';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';

// Helper to build the exact message the client must sign.
export const buildWalletAuthMessage: (nonce: number) => string = (
  nonce: number
) => {
  return `Welcome to FitFi!\n\nSign this message to authenticate.\n\nNonce: ${nonce}`;
};

/**
 * wallet-get-message
 * 1. Accepts a walletAddress
 * 2. Finds (or creates) the user
 * 3. Generates & stores a fresh nonce
 * 4. Returns the exact message the client must have the wallet sign
 */
const walletGetMessage: fn = catchAsync(async (req: Request, res: Response) => {
  const walletAddress: string | undefined = req.body.walletAddress;

  if (!walletAddress) {
    const response: APIResponse = {
      message: 'Wallet address is required.',
      details: {
        title: 'Missing Wallet Address',
        description: 'Provide walletAddress in request body.',
      },
      success: false,
      status: 'fail',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  let user: IUser | null = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
  });
  const nonce: number = generateNDigitRandomNumber(6);

  if (!user) {
    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      nonce,
      name: 'Anonymous',
    });
  } else {
    user.nonce = nonce;
    await user.save();
  }

  const message: string = buildWalletAuthMessage(user.nonce);

  const response: APIResponse = {
    message: 'Wallet authentication message generated successfully.',
    details: {
      title: 'Message Ready',
      description:
        'Sign the provided message with your wallet and submit the signature to /auth/wallet-auth.',
    },
    success: true,
    status: 'success',
    statusCode: 200,
    data: {
      walletAddress: user.walletAddress,
      nonce: user.nonce,
      message,
    },
  };

  return sendResponse(res, response);
});

export default walletGetMessage;
