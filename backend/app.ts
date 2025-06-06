import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';

// Loading not found file into memory for quick send.
const notFoundPage: NonSharedBuffer = fs.readFileSync('./misc/not-found.html');

const app: express.Express = express();

app.use(cors());

app.get('/api/v1', (_: Request, res: Response) => {
  const response: APIResponse = {
    message: {
      title: 'Welcome to FitFi API',
      description:
        'This is a welcome message to test whether the API is working or not.',
    },
    success: true,
    data: null,
  };
  res.status(200).json(response);
});

app.all('/api/v1/{*any}', (_: Request, res: Response) => {
  const response: APIResponse = {
    message: {
      title: 'This is not a valid backend route',
      description: 'Please check whether there is some type in the route',
    },
    success: false,
    data: null,
  };
  res.status(404).json(response);
});

app.all('{*any}', (_: Request, res: Response) => {
  res.status(404);
  res.setHeader('Content-Type', 'text/html');
  res.send(notFoundPage);
});

export default app;
