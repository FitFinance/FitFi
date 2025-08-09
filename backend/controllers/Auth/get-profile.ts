import { NextFunction, Response } from 'express';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import AppError from '../../utils/AppError.js';

const getProfile: fn = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const user: IUser | null = await User.findById(req.user._id).select('-nonce');

      if (!user) {
        return next(
          new AppError(
            'User not found',
            {
              title: 'User Not Found',
              description: 'Unable to find your user account.',
            },
            404
          )
        );
      }

      const response: APIResponse = {
        message: 'Profile retrieved successfully',
        details: {
          title: 'Profile Data',
          description: 'Your profile information has been retrieved.',
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
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
        },
      };

      return sendResponse(res, response);
    } catch (error: any) {
      console.error('❌ Error getting profile:', error);
      return next(
        new AppError(
          'Failed to retrieve profile',
          {
            title: 'Retrieval Failed',
            description: 'An error occurred while retrieving your profile. Please try again.',
          },
          500
        )
      );
    }
  }
);

export default getProfile;
