import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';

const updateDuel: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export default updateDuel;
