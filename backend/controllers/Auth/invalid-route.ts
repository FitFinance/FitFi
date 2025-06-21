import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

const invalidRoute: fn = catchAsync(
  async (_: Request, __: Response, next: NextFunction) => {
    return next(
      new AppError(
        'This is not a valid auth route',
        {
          title: 'Invalid Route',
          description:
            "You are trying to access a route that don't exists on auth",
        },
        400
      )
    );
  }
);

export default invalidRoute;
