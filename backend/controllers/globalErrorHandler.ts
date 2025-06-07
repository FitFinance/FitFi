import AppError from '../utils/AppError.js';
import { NextFunction, Request, Response } from 'express';

function sendErrorProd(err: AppError, _: Request, res: Response) {
  // Send minimal error details in production
  const response: APIResponse = {
    message: err.message,
    details: err.details,
    success: err.success,
    statusCode: err.statusCode,
    status: err.status,
    data: err.data,
  };
  return res.status(err.statusCode).json(response);
}

function sendErrorDev(err: AppError, _: Request, res: Response) {
  const response: APIResponse = {
    message: err.message,
    details: err.details,
    success: err.success,
    statusCode: err.statusCode,
    status: err.status,
    data: err.data,
    stack: (err as any).stack,
  };
  return res.status(err.statusCode).json(response);
}

// ! Do not remove next function even though it is not being used
function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // if (error.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // if (error.name === 'ValidationError')
    //   error = handleValidationErrorDB(error);
    // if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(err, req, res);
  }
}

export default globalErrorHandler;
