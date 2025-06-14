import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sendResponse from '../utils/sendResponse.js';
import catchAsync from '../utils/catchAsync.js';

const authenticate: fn = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
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
      const decoded: { role?: string } = jwt.verify(token, secret) as {
        role?: string;
      };

      if (!decoded.role) {
        response.details.title = 'Forbidden';
        response.details.description = 'User role not found in token.';
        response.statusCode = 403;
        response.message = 'Forbidden: User role not found.';
        return sendResponse(res, response);
      }
      (req as any).role = decoded.role;
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
