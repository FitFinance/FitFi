import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import User from '../../models/UserModel.js';
import generateToken from '../../utils/generateToken.js';
import sendResponse from '../../utils/sendResponse.js';
import crypto from 'crypto';

// Dummy ethers
type Ethers = {
  utils: {
    verifyMessage: (message: string, signature: string) => string;
  };
};

const ethers: Ethers = {
  utils: {
    verifyMessage: (message: string, _signature: string) => {
      return message;
    },
  },
};

const verifyAndLogin: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress: string | undefined = req.body?.walletAddress;
    const signature: string | undefined = req.body?.signature;
    const nonce: string | undefined = req.body?.nonce;

    if (!walletAddress || !signature || !nonce) {
      const response: IErrorMessage = {
        title: 'Insufficient parameters',
        description:
          'Either the wallet address, signature, or nonce is not sent from the frontend',
        context: {
          values: {
            walletAddress: `${walletAddress}`,
            signature: `${signature}`,
            nonce: `${nonce}`,
          },
        },
      };
      return next(
        new AppError(
          'Wallet address, signature, and nonce are required',
          response,
          400
        )
      );
    }

    const normalizedAddress: string = walletAddress.toLowerCase();

    const user: IUser | null = await User.findOne({
      walletAddress: normalizedAddress,
    });

    if (!user) {
      const response: IErrorMessage = {
        title: 'Wallet not found',
        description: 'Wallet not found. Please request nonce first.',
        context: {
          values: {
            walletAddress: `${walletAddress}`,
          },
        },
      };
      return next(
        new AppError(
          'Wallet not found. Please request nonce first.',
          response,
          400
        )
      );
    }

    const expectedSignature: string = crypto
      .createHmac('sha256', 'dummy_private_key_for_signing')
      .update(walletAddress + nonce)
      .digest('hex');

    if (signature !== expectedSignature) {
      const response: IErrorMessage = {
        title: 'Invalid signature',
        description: 'Invalid signature for given wallet address and nonce.',
        context: {
          values: {
            walletAddress: `${walletAddress}`,
            signature: `${signature}`,
            nonce: `${nonce}`,
          },
        },
      };
      return next(
        new AppError(
          'Invalid signature for given wallet address and nonce',
          response,
          401
        )
      );
    }

    // Update nonce to prevent replay attacks
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();
    console.log(user._id);
    const token: string | undefined | void = await generateToken(
      String(user._id),
      next
    );
    if (!token) return;

    const response: APIResponse = {
      message: 'Login successful',
      details: {
        title: 'Successfully logged in',
        description: 'You were able to login successfully',
      },
      status: 'success',
      statusCode: 200,
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          walletAddress: user.walletAddress,
        },
      },
    };

    return sendResponse(res, response);
  }
);

export default verifyAndLogin;
