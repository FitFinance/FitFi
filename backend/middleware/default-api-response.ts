import { Request, Response } from 'express';
// This will be the default response if
// someone tries to fetch from /api/v1

function defaultApiResponse(_: Request, res: Response) {
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
}

export default defaultApiResponse;
