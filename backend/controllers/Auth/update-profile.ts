import { NextFunction, Response } from 'express';

import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import AppError from '../../utils/AppError.js';

const updateProfile: fn = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name }: { name: string } = req.body;

    if (!name || typeof name !== 'string') {
      return next(
        new AppError(
          'Name is required and must be a string',
          {
            title: 'Invalid Input',
            description: 'Please provide a valid name (1-50 characters).',
          },
          400
        )
      );
    }

    // Validate name length and content
    const trimmedName: string = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      return next(
        new AppError(
          'Name must be between 1 and 50 characters',
          {
            title: 'Invalid Name Length',
            description: 'Name should be between 1 and 50 characters long.',
          },
          400
        )
      );
    }

    // Basic validation for inappropriate content (you can expand this)
    const inappropriatePattern: RegExp =
      /^(anonymous|guest|admin|null|undefined)$/i;
    if (inappropriatePattern.test(trimmedName)) {
      return next(
        new AppError(
          'Please choose a different name',
          {
            title: 'Invalid Name',
            description:
              'This name is not allowed. Please choose another name.',
          },
          400
        )
      );
    }

    try {
      // Update user profile
      const updatedUser: IUser | null = await User.findByIdAndUpdate(
        req.user._id,
        {
          name: trimmedName,
          lastLogin: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).select('-nonce');

      if (!updatedUser) {
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
        message: 'Profile updated successfully',
        details: {
          title: 'Profile Updated',
          description: 'Your profile name has been updated successfully.',
        },
        success: true,
        status: 'success',
        statusCode: 200,
        data: {
          user: {
            id: updatedUser._id,
            walletAddress: updatedUser.walletAddress,
            name: updatedUser.name,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
          },
        },
      };

      return sendResponse(res, response);
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      return next(
        new AppError(
          'Failed to update profile',
          {
            title: 'Update Failed',
            description:
              'An error occurred while updating your profile. Please try again.',
          },
          500
        )
      );
    }
  }
);

export default updateProfile;
