import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware factory to validate the presence of required environment variables.
 *
 * This function returns an Express middleware that checks if the specified environment
 * variables are set in `process.env`. If any are missing, it passes an `AppError` to
 * the next middleware with details about the missing variables. If all are present,
 * it attaches the found environment variables to `req.envs` for downstream use.
 *
 * @param variables - The names of the required environment variables to check.
 * @returns An Express middleware function that validates the required environment variables.
 */
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
