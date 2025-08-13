import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/UserModel.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import AppError from '../../utils/AppError.js';
import generateToken from '../../utils/generateToken.js';

// Expected body: { username, password, appVersion }
const login: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      username,
      password,
      appVersion,
    }: { username?: string; password?: string; appVersion?: string } = req.body;

    if (!username || !password) {
      return next(
        new AppError(
          'Missing credentials',
          {
            title: 'Invalid Input',
            description: 'username and password are required',
          },
          400
        )
      );
    }

    const normUsername: string = username.toLowerCase();
    const user: (IUser & { passwordHash?: string }) | null = await User.findOne(
      { username: normUsername }
    ).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return next(
        new AppError(
          'Invalid credentials',
          {
            title: 'Auth Failed',
            description: 'User not found or password not set',
          },
          401
        )
      );
    }

    const valid: boolean = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return next(
        new AppError(
          'Invalid credentials',
          { title: 'Auth Failed', description: 'Password incorrect' },
          401
        )
      );
    }

    const isFirstLogin: boolean = !user.firstLoginAt;
    if (isFirstLogin) {
      user.firstLoginAt = new Date();
      user.signupAppVersion = user.signupAppVersion || appVersion; // if not set (legacy user), set now
    }
    user.lastLogin = new Date();
    user.lastLoginAppVersion = appVersion || user.lastLoginAppVersion;
    await user.save();

    const token: string | void = generateToken(user._id.toString(), req);

    const response: APIResponse = {
      message: 'User authenticated successfully',
      details: { title: 'Login Success', description: 'Authenticated' },
      status: 'success',
      statusCode: 200,
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          walletAddress: user.walletAddress,
          signupAppVersion: user.signupAppVersion,
          lastLoginAppVersion: user.lastLoginAppVersion,
          isFirstLogin,
        },
        token,
      },
    };
    return sendResponse(res, response);
  }
);

export default login;
