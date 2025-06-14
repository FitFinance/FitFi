import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../utils/sendResponse.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/UserModel.js';

const authenticate: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers.authorization;
    const response: APIResponse = {
      message: 'Authentication failed',
      details: {
        title: 'Authentication Error',
        description: 'You must be authenticated to access this resource.',
      },
      success: false,
      status: 'error',
      statusCode: 401,
      data: null,
    };
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, response);
    }

    const token: string = authHeader.split(' ')[1];

    try {
      const secret: string = process.env.JWT_SECRET || 'your_jwt_secret';
      const userId: string | JwtPayload = jwt.verify(token, secret);

      if (!userId) {
        response.details.title = 'Forbidden';
        response.details.description = 'User ID not found in token.';
        response.statusCode = 403;
        response.message = 'Forbidden: User ID not found.';
        return sendResponse(res, response);
      }
      const user: IUser = await User.findById(userId).select('-password');
      if (!user) {
        response.details.title = 'User Not Found';
        response.details.description = 'No user found with the provided token.';
        response.statusCode = 404;
        response.message = 'User not found.';
        return sendResponse(res, response);
      }
      (req as any).user = user;
      next();
    } catch (err) {
      response.details.title = 'Invalid Token';
      response.details.description =
        'The provided token is invalid or has expired.';
      response.statusCode = 401;
      response.message = 'Invalid or expired token.';
      return sendResponse(res, response);
    }
  }
);

export default authenticate;
