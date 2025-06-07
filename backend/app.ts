import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/globalErrorHandler.js';
import AuthRoutes from './routes/Auth.js';

dotenv.config({
  path: ['./.env', './secrets.env'],
});

const app: express.Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1', (_: Request, res: Response) => {
  const statusCode: number = 200;
  const response: APIResponse = {
    message: 'Welcome to FitFi API',
    details: {
      title: 'FitFi Backend API',
      description:
        'This is a welcome message to test whether the API is working or not.',
    },
    success: true,
    status: 'success',
    statusCode: statusCode,
    data: null,
  };
  res.status(statusCode).json(response);
});

app.use('/api/v1/auth', AuthRoutes);

app.all('/{*any}', (req: Request, _: Response, next: NextFunction) => {
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
});

app.use(globalErrorHandler);

export default app;
