class AppError {
  details: IErrorMessage;
  statusCode: number;
  status: TStatus;
  isOperational: boolean;
  success: boolean;
  data: any;

  constructor(message: string, details: IErrorMessage, statusCode: number) {
    // Keep Error-like shape
    (this as any).message = message;
    this.details = details;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.success = statusCode >= 200 && statusCode < 400;
    this.data = null;
  }
}

export default AppError;
