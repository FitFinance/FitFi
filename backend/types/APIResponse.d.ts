type TStatus = 'error' | 'success' | 'warning' | 'fail';

interface IErrorMessage {
  title: string;
  description: string;
  context?: any;
}

interface APIResponse {
  message?: string;
  details: IErrorMessage;
  success: boolean;
  status: TStatus;
  statusCode?: number;
  data?: any;
  stack?: Error['stack'];
}
