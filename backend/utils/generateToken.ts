import jwt, { Secret } from 'jsonwebtoken';
import AppError from './AppError.js';
import { NextFunction } from 'express';

function generateToken(userId: string, next: NextFunction): string | void {
  const SECRET: string | undefined = process.env.JWT_SECRET;
  const TTL: string | undefined = process.env.JWT_TTL;

  if (!SECRET || !TTL) {
    return next(
      new AppError(
        'Unable to find JWT Secret or TTL',
        {
          title: 'Internal Server Error',
          description:
            'We were not able to read the JWT Secret or TTL from the environment variables',
        },
        500
      )
    );
  }

  // TODO: Unsafe code, check why TTL is not being taken as string input
  return jwt.sign({ userId }, SECRET as Secret, {
    expiresIn: TTL as any,
  });
}

export default generateToken;
