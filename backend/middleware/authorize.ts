import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

function authorize(...roles: string[]): fn {
  return catchAsync((req: Request, _: Response, next: NextFunction) => {
    const userRole: string = (req as any).user.role;
    if (!roles.includes(userRole)) {
      return next(
        new AppError(
          'You are not authorized for the action',
          {
            title: 'Unauthorized',
            description: 'Your role does not permit this action.',
          },
          403
        )
      );
    }
    next();
  });
}
export default authorize;
