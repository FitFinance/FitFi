import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';

function authorize(
  ...roles: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user || !roles.includes((req as any).user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  });
}
export default authorize;
