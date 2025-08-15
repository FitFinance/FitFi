import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/UserModel.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import AppError from '../../utils/AppError.js';
import generateToken from '../../utils/generateToken.js';

// Expected body: { username, password, walletAddress, appVersion }
const register: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      username,
      password,
      walletAddress,
      appVersion,
    }: {
      username?: string;
      password?: string;
      walletAddress?: string;
      appVersion?: string;
    } = req.body;

    if (!username || !password || !walletAddress) {
      return next(
        new AppError(
          'Missing required fields',
          {
            title: 'Invalid Input',
            description: 'username, password and walletAddress are required',
          },
          400
        )
      );
    }

    const normUsername: string = username.toLowerCase();
    const existingUser: IUser | null = await User.findOne({
      $or: [
        { username: normUsername },
        { walletAddress: walletAddress.toLowerCase() },
      ],
    }).select('+passwordHash');
    if (existingUser) {
      return next(
        new AppError(
          'User already exists',
          {
            title: 'Conflict',
            description: 'Username or wallet already registered',
          },
          409
        )
      );
    }

    const passwordHash: string = await bcrypt.hash(password, 12);

    const user: IUser = await User.create({
      username: normUsername,
      walletAddress: walletAddress.toLowerCase(),
      passwordHash,
      signupAppVersion: appVersion,
      lastLoginAppVersion: appVersion,
      firstLoginAt: new Date(),
    });

    const token: string | void = generateToken(user._id.toString(), req);

    const response: APIResponse = {
      message: 'User registered successfully',
      details: {
        title: 'Registration Complete',
        description: 'Account created',
      },
      status: 'success',
      statusCode: 201,
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          walletAddress: user.walletAddress,
          signupAppVersion: user.signupAppVersion,
          isNewUser: true,
        },
        token,
      },
    };
    return sendResponse(res, response);
  }
);

export default register;
