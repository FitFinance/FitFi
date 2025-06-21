import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

function validateRequiredEnvVariables(...variables: string[]) {
  return catchAsync((req: Request, _: Response, next: NextFunction) => {
    const missing: string[] = variables.filter(
      (name: string) => !process.env[name]
    );
    if (missing.length > 0) {
      return next(
        new AppError(
          `Missing required environment variables: ${missing.join(', ')}`,
          {
            title: 'Internal Server Error',
            description: 'Some required environment variables are missing.',
            context: missing,
          },
          500
        )
      );
    }

    // Attach env variables to req.envs
    (req as any).envs = (req as any).envs || {};
    variables.forEach((name: string) => {
      (req as any).envs[name] = process.env[name];
    });

    next();
  });
}

export default validateRequiredEnvVariables;
