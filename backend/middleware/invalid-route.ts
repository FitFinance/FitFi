import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError.js';

function invalidRouteHandler(req: Request, _: Response, next: NextFunction) {
  return next(
    new AppError(
      `There is no route '${req.originalUrl}'`,
      {
        title: 'Invalid Route',
        description:
          'You are trying to reach a route that is not present on the backend please recheck for any typo in the string',
      },
      404
    )
  );
}

export default invalidRouteHandler;
