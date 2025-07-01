import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

let notFoundPage: string | undefined;

try {
  console.log(chalk.bgBlue.white('INFO: '), 'Trying to load invalid URL page');
  notFoundPage = fs.readFileSync(
    path.resolve(process.cwd(), 'misc/not-found.html'),
    { encoding: 'utf-8' }
  );
  console.log(
    chalk.bgRed.white('ERROR: '),
    'Unable to load invalid URL fallback page'
  );
  console.log(
    chalk.bgYellow.black('INFO: '),
    'Falling back to JSON response for invalid API'
  );
} catch (err) {
  notFoundPage = undefined;
}

function invalidRouteHandler(req: Request, res: Response, next: NextFunction) {
  if (notFoundPage) {
    res.send(notFoundPage);
  } else {
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
}
export default invalidRouteHandler;
