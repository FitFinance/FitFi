import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import sendResponse from '../utils/sendResponse.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/UserModel.js';

const authenticate: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress: string | undefined = req.headers[
      'x-wallet-address'
    ] as string;
    const signature: string | undefined = req.headers['x-signature'] as string;
    const nonce: string | undefined = req.headers['x-nonce'] as string;

    const response: APIResponse = {
      message: 'Authentication failed',
      details: {
        title: 'Authentication Error',
        description: 'You must be authenticated to access this resource.',
      },
      success: false,
      status: 'error',
      statusCode: 401,
      data: null,
    };

    if (!walletAddress || !signature || !nonce) {
      response.details.description =
        'Wallet address, signature, and nonce are required.';
      return sendResponse(res, response);
    }

    const normalizedAddress: string = walletAddress.toLowerCase();

    const user: IUser | null = await User.findOne({
      walletAddress: normalizedAddress,
    });

    if (!user) {
      response.details.title = 'Wallet Not Found';
      response.details.description =
        'No user found with the provided wallet address.';
      response.statusCode = 403;
      response.message = 'User not found.';
      return sendResponse(res, response);
    }

    const expectedSignature: string = crypto
      .createHmac('sha256', 'dummy_private_key_for_signing')
      .update(walletAddress + nonce)
      .digest('hex');

    if (signature !== expectedSignature) {
      response.details.title = 'Invalid Signature';
      response.details.description = 'The provided signature is invalid.';
      response.statusCode = 401;
      response.message = 'Invalid signature.';
      return sendResponse(res, response);
    }

    (req as any).user = user;
    next();
  }
);

export default authenticate;
