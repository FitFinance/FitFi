import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import User from '../../models/UserModel.js';
import getRedisClient from '../../services/redis/index.js';
import AppError from '../../utils/AppError.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';
import generateToken from '../../utils/generateToken.js';

const verifyOtp: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress: string | undefined = req.body.walletAddress;
    const otp: string | undefined = req.body.otp;

    if (!walletAddress || !otp) {
      return sendResponse(res, {
        message: 'Wallet address and OTP are required.',
        details: { title: 'Missing Fields', description: '' },
        status: 'fail',
        statusCode: 400,
        success: false,
      });
    }

    const redis: any = await getRedisClient();
    const key: string = `otp:${walletAddress.toLowerCase()}`;
    const raw: string | null = await redis.get(key);

    if (!raw) {
      return next(
        new AppError(
          'No OTP pending for this address. Request a new OTP.',
          { title: 'No OTP', description: '' },
          400
        )
      );
    }

    let payload: { otp: string; expiry: number; otpId: number };
    try {
      payload = JSON.parse(raw);
    } catch {
      return next(
        new AppError(
          'Corrupt OTP data. Please request again.',
          { title: 'Server Error', description: '' },
          500
        )
      );
    }

    if (Math.floor(Date.now() / 1000) > payload.expiry) {
      await redis.del(key);
      return next(
        new AppError(
          'OTP expired. Please request a new OTP.',
          { title: 'Expired', description: '' },
          400
        )
      );
    }

    if (payload.otp !== otp) {
      return next(
        new AppError('Invalid OTP.', { title: 'Invalid', description: '' }, 401)
      );
    }

    // OTP valid: clear redis and create user if needed, set nonce
    await redis.del(key);

    let updated: IUser | null = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    const newNonce: number = generateNDigitRandomNumber(6);
    if (!updated) {
      updated = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        nonce: newNonce,
      });
    } else {
      updated.nonce = newNonce;
      await updated.save();
    }

    const token: string | void = generateToken(updated._id as string, req);
    if (!token) {
      return next(
        new AppError(
          'Failed to generate token.',
          { title: 'Token Error', description: '' },
          500
        )
      );
    }

    return sendResponse(res, {
      message: 'Signup/Login successful via OTP',
      details: { title: '', description: '' },
      status: 'success',
      statusCode: 200,
      success: true,
      data: {
        token,
        walletAddress: updated.walletAddress,
        nonce: updated.nonce,
      },
    });
  }
);

export default verifyOtp;
