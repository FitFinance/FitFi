import { NextFunction, Request, Response } from 'express';
import { ethers } from 'ethers';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import AppError from '../../utils/AppError.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import generateToken from '../../utils/generateToken.js';

const verifyAndLogin: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature: string | undefined = req.body.signature;
    const walletAddress: string | undefined = req.body.walletAddress;
    const nonce: string | number | undefined = req.body.nonce;

    if (!signature || !walletAddress || !nonce) {
      const response: APIResponse = {
        message: 'Missing signature, wallet address, or nonce.',
        details: {
          title: 'Invalid Request',
          description: 'Signature, wallet address, and nonce are all required.',
        },
        status: 'fail',
        statusCode: 400,
        success: false,
      };

      return sendResponse(res, response);
    }

    let user: IUser | null = await User.findOne({ walletAddress });

    if (!user) {
      const response: APIResponse = {
        message:
          'User with the provided wallet address was not found in the database.',
        details: {
          title: 'User Not Found',
          description:
            'No account exists for this wallet address. Please create an account first using the /auth/get-nonce route.',
          context: {
            step1:
              'Call /auth/get-nonce to create a user if one does not already exist.',
            step2:
              'After creating the user, you can proceed to verify and login.',
          },
        },
        success: false,
        status: 'error',
        statusCode: 404,
      };
      return sendResponse(res, response);
    }

    let recoveredAddress: string | undefined;

    // Create the message that was signed by the user
    const message = `Welcome to FitFi!\n\nSign this message to verify your identity.\n\nNonce: ${nonce}`;

    try {
      // Check if we're in development mode and allow demo signatures
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isMockSignature = signature.includes('mock');

      console.log('🔍 Development mode:', isDevelopment);
      console.log('🔍 Signature received:', signature);
      console.log('🔍 Is mock signature:', isMockSignature);

      if (isDevelopment && isMockSignature) {
        // Development mode: Allow mock signatures for testing
        console.log(
          '🧪 Development mode: Accepting mock signature for testing'
        );
        recoveredAddress = walletAddress; // Accept the provided wallet address
      } else if (isMockSignature) {
        // Production mode but mock signature detected - reject it
        console.error('❌ Mock signature detected in production mode');
        return next(
          new AppError(
            'Mock signatures are not allowed in production mode',
            {
              title: 'Invalid Signature',
              description:
                'Demo/mock signatures are only allowed in development mode. Please use a real wallet to sign the message.',
            },
            401
          )
        );
      } else {
        // Production mode or real signature: Verify the signature properly
        recoveredAddress = ethers.verifyMessage(message, signature);
        console.log('🔍 Recovered address:', recoveredAddress);
        console.log('📝 Expected address:', walletAddress);
      }
    } catch (err: any) {
      console.error('❌ Signature verification failed:', err);
      return next(
        new AppError(
          'Signature verification failed',
          {
            title: 'Invalid Signature',
            description:
              'The provided signature could not be verified. Please ensure you are signing the correct message with your wallet.',
          },
          401
        )
      );
    }

    // Compare addresses (case insensitive)
    if (recoveredAddress?.toLowerCase() !== walletAddress?.toLowerCase()) {
      console.error('❌ Address mismatch:', {
        recovered: recoveredAddress?.toLowerCase(),
        provided: walletAddress?.toLowerCase(),
      });
      return next(
        new AppError(
          'Signature does not match the provided wallet address.',
          {
            title: 'Signature Mismatch',
            description:
              'The signature is valid, but it does not correspond to the given wallet address. Please ensure you are signing with the correct wallet.',
          },
          401
        )
      );
    }

    // Verify the nonce matches what we have stored
    if (user.nonce.toString() !== nonce.toString()) {
      return next(
        new AppError(
          'Invalid nonce. Please request a new nonce.',
          {
            title: 'Nonce Mismatch',
            description:
              'The provided nonce does not match what was issued. Please request a new nonce and try again.',
          },
          401
        )
      );
    }

    user.nonce = generateNDigitRandomNumber(6);
    await user.save();

    console.log(user._id);
    const token: string | void = generateToken(user._id as string, req);
    if (!token) {
      // # Don't think this code section will ever be used but for safetly I have added it here
      // don't remove
      const response: APIResponse = {
        message: 'Failed to generate authentication token.',
        details: {
          title: 'Token Generation Error',
          description:
            'An error occurred while generating the authentication token. Please try again.',
        },
        success: false,
        status: 'error',
        statusCode: 500,
      };
      return sendResponse(res, response);
    }

    const response: APIResponse = {
      message: 'User was verified successfully',
      details: {
        title: '',
        description: '',
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        nonce: user.nonce,
        walletAddress: user.walletAddress,
        token: token,
      },
    };

    return sendResponse(res, response);
  }
);

export default verifyAndLogin;
