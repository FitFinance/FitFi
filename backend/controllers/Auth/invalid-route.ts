import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';

const invalidRoute: fn = catchAsync(
  (_req: Request, res: Response, _next: NextFunction) => {
    const response: APIResponse = {
      message: 'This is not a valid route',
      details: {
        title: 'Invalid Route',
        description:
          "This is and invalid route please check for type after string 'api/v1/auth/'",
      },
      success: false,
      status: 'error',
      statusCode: 204,
    };
    sendResponse(res, response);
  }
);

export default invalidRoute;
