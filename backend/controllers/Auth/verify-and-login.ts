import { NextFunction, Request, Response } from 'express';

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

    if (!signature || !walletAddress) {
      const response: APIResponse = {
        message: 'Missing signature or wallet address.',
        details: {
          title: 'Invalid Request',
          description: 'Both signature and wallet address are required.',
        },
        status: 'fail',
        statusCode: 400,
        success: false,
      };

      sendResponse(res, response);
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

    // ? Will be used in future don't remove
    // const nonce: string = `Nonce: ${user.nonce}`;

    try {
      // recoveredAddress = some wallet function to recover address
      // recoveredAddress = ethers.utils.verifyMessage(nonce, signature);
      let num: number = generateNDigitRandomNumber(2);
      if (num < 10) throw 'Fail';
    } catch (err: any) {
      return next(
        new AppError(
          'Signature verification failed',
          {
            title: 'Invalid Signature',
            description:
              'The provided signature could not be verified. Please ensure you are signing the correct nonce with your wallet.',
          },
          401
        )
      );
    }

    if (recoveredAddress != user?.walletAddress) {
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
