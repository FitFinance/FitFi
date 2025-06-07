import { NextFunction, Request, Response } from 'express';

declare global {
  type fn = (req: Request, res: Response, next: NextFunction) => any;
}
