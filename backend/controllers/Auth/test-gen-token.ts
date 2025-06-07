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
    return res.send('Valid response');
  }
);

export default testGenToken;
