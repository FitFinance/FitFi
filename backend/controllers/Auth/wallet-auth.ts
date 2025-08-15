import { NextFunction, Request, Response } from 'express';
import { ethers } from 'ethers';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import AppError from '../../utils/AppError.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import generateToken from '../../utils/generateToken.js';
import { buildWalletAuthMessage } from './wallet-get-message.js';

const walletAuth: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature: string | undefined = req.body.signature;
    const walletAddress: string | undefined = req.body.walletAddress;

    if (!signature || !walletAddress) {
      const response: APIResponse = {
        message: 'Missing signature or wallet address.',
        details: {
          title: 'Invalid Request',
          description: 'Signature and wallet address are required.',
        },
        status: 'fail',
        statusCode: 400,
        success: false,
      };

      return sendResponse(res, response);
    }

    let userForMessage: IUser | null = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    if (!userForMessage) {
      return next(
        new AppError(
          'User not initialized. Retrieve message first.',
          {
            title: 'Message Not Requested',
            description:
              'Call /auth/wallet-get-message with walletAddress to initialize user & get message to sign.',
          },
          400
        )
      );
    }
    const message: string = buildWalletAuthMessage(userForMessage.nonce);

    let recoveredAddress: string | undefined;

    try {
      // Determine environment + mock
      const isDevelopment: boolean = process.env.NODE_ENV === 'development';
      const isMockSignature: boolean = signature.includes('mock');

      console.log('🔍 Development mode:', isDevelopment);
      console.log('🔍 Signature received:', signature);
      console.log('🔍 Is mock signature:', isMockSignature);

      if (isDevelopment && isMockSignature) {
        console.log(
          '🧪 Development mode: Accepting mock signature for testing'
        );
        recoveredAddress = walletAddress;
      } else if (isMockSignature) {
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
        // Basic format validation before expensive operations
        const hexSigRegex: RegExp = /^0x[0-9a-fA-F]{130}$/;
        if (!hexSigRegex.test(signature)) {
          return next(
            new AppError(
              'Invalid signature format',
              {
                title: 'Malformed Signature',
                description:
                  'The provided signature is not a valid 65-byte hex string. Please sign the message again in your wallet.',
              },
              400
            )
          );
        }

        // Attempt personal_sign first
        try {
          recoveredAddress = ethers.verifyMessage(message, signature);
          console.log(
            '🔍 Recovered address (personal_sign):',
            recoveredAddress
          );
        } catch (personalSignError) {
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

    let user: IUser | null = userForMessage;
    const isNewUser: boolean = false;

    console.log('👤 User ID:', user._id);
    const token: string | void = generateToken(user._id as string, req);

    user.nonce = generateNDigitRandomNumber(6); // rotate for next round
    user.lastLogin = new Date();
    await user.save();

    const response: APIResponse = {
      message: 'User authenticated successfully',
      details: {
        title: 'Authentication Success',
        description:
          'You have been successfully authenticated with your wallet.',
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          name: user.name || 'Anonymous',
          role: user.role,
          isNewUser: false,
        },
        nonce: user.nonce, // new nonce for subsequent logins
        token: token,
      },
    };

    return sendResponse(res, response);
  }
);

export default walletAuth;
