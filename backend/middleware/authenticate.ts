import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/UserModel.js';
import AppError from '../utils/AppError.js';

const authenticate: fn = catchAsync(
  async (req: Request, _: Response, next: NextFunction) => {
    const token: string | undefined = req.headers.authorization;

    if (!token) {
      return next(
        new AppError(
          'User not Authenticated',
          {
            title: 'Token not found',
            description:
              'You need to send authorization header to access this route',
          },
          401
        )
      );
    }

    const tokenVal: string | undefined = token?.split(' ')[1];
    if (!tokenVal) {
      return next(
        new AppError(
          'Empty token found',
          {
            title: 'Token is empty',
            description:
              'Authorization header is present but token is missing.',
          },
          401
        )
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tokenVal, (req as any).envs.JWT_SECRET as string);
    } catch (err) {
      return next(
        new AppError(
          'Invalid or expired token',
          {
            title: 'Token verification failed',
            description: 'The provided token is invalid or has expired.',
          },
          401
        )
      );
    }

    let userId: string | undefined = decoded.userId;

    if (!userId) {
      return next(
        new AppError(
          'User ID not found in token',
          {
            title: 'Invalid token payload',
            description: 'The token does not contain a valid user ID.',
          },
          401
        )
      );
    }

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return next(
        new AppError(
          'User not found',
          {
            title: 'User does not exist',
            description: 'No user found with the provided user ID.',
          },
          401
        )
      );
    }

    (req as any).user = user;
    next();
  }
);

export default authenticate;
