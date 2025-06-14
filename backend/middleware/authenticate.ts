import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/UserModel.js';

const authenticate: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId: string | undefined = req.headers['user-id'] as string;
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized: User not found',
        success: false,
        statusCode: 401,
      });
    }

    (req as any).user = user; // Attach user to request object
    next();
  }
);

export default authenticate;
