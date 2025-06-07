class AppError extends Error implements APIResponse {
  details: IErrorMessage;
  statusCode: number;
  status: TStatus;
  isOperational: boolean;
  success: boolean;
  data: any;

  constructor(message: IErrorMessage, statusCode: number) {
    super(message.title);
    this.details = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.success = statusCode >= 200 && statusCode < 400;
    this.data = null;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
