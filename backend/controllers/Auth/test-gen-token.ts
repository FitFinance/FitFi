import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import generateToken from '../../utils/generateToken.js';

const testGenToken: fn = catchAsync(
  async (_: Request, res: Response, next: NextFunction) => {
    const token: string | undefined | void = await generateToken(
      'this is user id',
      next
    );
    if (!token) return; // Ensure no response is sent if an error occurs
    const response: APIResponse = {
      message: 'Your token was generated successfully',
      details: {
        title: 'Login Token',
        description:
          'A new authentication token has been generated for the user.',
        context: 'Token Generation',
      },
      statusCode: 200,
      status: 'success',
      success: true,
      data: {
        token: token || '',
      },
    };
    return res.status(200).json(response);
  }
);

export default testGenToken;
