import { NextFunction, Request, Response } from 'express';
import { ethers } from 'ethers';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import AppError from '../../utils/AppError.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import generateToken from '../../utils/generateToken.js';

const walletAuth: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature: string | undefined = req.body.signature;
    const walletAddress: string | undefined = req.body.walletAddress;
    const message: string | undefined = req.body.message;

    if (!signature || !walletAddress || !message) {
      const response: APIResponse = {
        message: 'Missing signature, wallet address, or message.',
        details: {
          title: 'Invalid Request',
          description:
            'Signature, wallet address, and message are all required.',
        },
        status: 'fail',
        statusCode: 400,
        success: false,
      };

      return sendResponse(res, response);
    }

    let recoveredAddress: string | undefined;

    try {
      // Check if we're in development mode and allow demo signatures
      const isDevelopment: boolean = process.env.NODE_ENV === 'development';
      const isMockSignature: boolean = signature.includes('mock');

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
        // Try personal_sign style first (most common)
        try {
          recoveredAddress = ethers.verifyMessage(message, signature);
          console.log(
            '🔍 Recovered address (personal_sign):',
            recoveredAddress
          );
        } catch (personalSignError) {
          // Fallback for eth_sign: recover address from keccak256(message)
          try {
            const hash: string = ethers.keccak256(ethers.toUtf8Bytes(message));
            recoveredAddress = ethers.recoverAddress(hash, signature);
            console.log(
              '🔍 Recovered address (eth_sign fallback):',
              recoveredAddress
            );
          } catch (ethSignError) {
            console.error('❌ Both signature verification methods failed:', {
              personalSignError,
              ethSignError,
            });
            throw ethSignError;
          }
        }
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

    // Find or create user
    let user: IUser | null = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    let isNewUser: boolean = false;

    if (!user) {
      // Create new user
      console.log('🆕 Creating new user for wallet:', walletAddress);
      const nonce: number = generateNDigitRandomNumber(6);
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        nonce,
      });
      isNewUser = true;
    } else {
      // Update existing user's nonce
      console.log('✅ Existing user found for wallet:', walletAddress);
      user.nonce = generateNDigitRandomNumber(6);
      await user.save();
    }

    console.log('👤 User ID:', user._id);
    const token: string | void = generateToken(user._id as string, req);

    if (!token) {
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
      message: isNewUser
        ? 'User created and authenticated successfully'
        : 'User authenticated successfully',
      details: {
        title: 'Authentication Success',
        description:
          'You have been successfully authenticated with your wallet.',
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        nonce: user.nonce,
        walletAddress: user.walletAddress,
        token: token,
        isNewUser: isNewUser,
      },
    };

    return sendResponse(res, response);
  }
);

export default walletAuth;
