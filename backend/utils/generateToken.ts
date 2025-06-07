import jwt from 'jsonwebtoken';
import AppError from './AppError.js';
import { NextFunction } from 'express';

async function generateToken(userId: string, next: NextFunction) {
  console.log(process.env.JWT_SECRET);

  const token: string | undefined = process.env?.JWT_TOKEN;
  if (!token) {
    return next(
      new AppError(
        'Unable to find JWT Secret',
        {
          title: 'Internal Server Error',
          description:
            'We were not able to read the JWT Secret from the secrets file',
          context: {
            heading: 'This error could occur due to following reasons',
            reasons: [
              "'secrets.env' file is missing",
              "App was not able to read 'secrets.env' either due to invalid dotenv configuration or due to error in file name",
            ],
          },
        },
        500
      )
    );
  }

  return jwt.sign({ userId }, token, { expiresIn: '7d' });
}

export default generateToken;
