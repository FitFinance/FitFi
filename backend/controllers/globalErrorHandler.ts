import AppError from '../utils/AppError.js';
import { Request, Response } from 'express';

function sendErrorProd(err: APIResponse, req: Request, res: Response) {
  // Send minimal error details in production
  res.status(err.statusCode).json({
    message: err.message,
    details: err.details,
    success: err.success,
    statusCode: err.statusCode,
    status: err.status,
    data: err.data,
  });
}

function sendErrorDev(err: APIResponse, req: Request, res: Response) {
  res.status(err.statusCode).json({
    message: err.message,
    details: err.details,
    success: err.success,
    statusCode: err.statusCode,
    status: err.status,
    data: err.data,
    stack: (err as any).stack,
  });
}

function globalErrorHandler(err: AppError, req: Request, res: Response) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error: APIResponse = { ...err };

    // if (error.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // if (error.name === 'ValidationError')
    //   error = handleValidationErrorDB(error);
    // if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
}

export default globalErrorHandler;
