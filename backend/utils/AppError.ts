class AppError extends Error implements Required<APIResponse> {
  details: IErrorMessage;
  statusCode: number;
  status: TStatus;
  isOperational: boolean;
  success: boolean;
  data: any;
  stack: any;

  constructor(message: string, details: IErrorMessage, statusCode: number) {
    super(message);
    this.details = details;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.success = statusCode >= 200 && statusCode < 400;
    this.data = null;

    Error.captureStackTrace(this, this.constructor);
    // Ensure stack is always a string
    this.stack = this.stack || '';
  }
}

export default AppError;
