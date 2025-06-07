import { Request, Response, NextFunction } from 'express';
import User from '../../models/UserModel.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

const requestNonce: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress: string | undefined = req.body?.walletAddress;

    if (!walletAddress) {
      const response: IErrorMessage = {
        title: 'Missing Wallet Address',
        description:
          'The wallet address field is required in the request body.',
        context: {
          1: 'walletAddress parameter is undefined or empty',
          2: 'Client did not provide a wallet address for authentication',
        },
      };
      return next(new AppError('Wallet Address not found', response, 400));
    }

    const normalizedAddress: string = walletAddress.toLowerCase();

    let user: IUser | null = await User.findOne({
      walletAddress: normalizedAddress,
    });

    if (!user) {
      // TODO: For now I am first creating then again finding user because of typescript showing error
      user = await User.create({
        walletAddress: normalizedAddress,
      });
    } else {
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();
    }
    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'User not found after creation',
        data: null,
        error: {
          title: 'User Creation Failed',
          description: 'User could not be found after creation attempt.',
          context: {
            1: 'User.create returned null or undefined',
            2: 'Possible database issue or validation error',
          },
        },
      });
    }
    return res.status(200).json({
      message: 'Nonce generated successfully',
      details: {
        title: 'Nonce Generated',
        description:
          'A nonce has been generated for the provided wallet address.',
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: { nonce: user.nonce },
    });
  }
);

export default requestNonce;
