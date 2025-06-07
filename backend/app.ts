import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import fs from 'fs';
import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/globalErrorHandler.js';

// Loading not found file into memory for quick send.
// const notFoundPage: NonSharedBuffer = fs.readFileSync('./misc/not-found.html');

const app: express.Express = express();

dotenv.config();
app.use(cors());

app.get('/api/v1', (_: Request, res: Response) => {
  const response: APIResponse = {
    message: 'Welcome to FitFi API',
    details: {
      title: 'FitFi Backend API',
      description:
        'This is a welcome message to test whether the API is working or not.',
    },
    success: true,
    status: 'success',
    statusCode: 200,
    data: null,
  };
  res.status(200).json(response);
});

app.all('/api/v1/{*any}', (_: Request, __: Response, next: NextFunction) => {
  const response: IErrorMessage = {
    title: 'Invalid Route',
    description: 'Please check whether there is some type in the route',
  };
  next(new AppError('This is not a valid backend routes', response, 404));
});

app.all('/{*any}', (req: Request, _: Response, next: NextFunction) => {
  next(
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
  // res.status(404);
  // res.setHeader('Content-Type', 'text/html');
  // res.send(notFoundPage);
});

app.use(globalErrorHandler);

export default app;
