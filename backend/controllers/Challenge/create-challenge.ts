import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';

const createChallenge: fn = catchAsync(async (_: Request, res: Response) => {
  const response: APIResponse = {
    message: 'This endpoint is not implemented yet.',
    details: {
      title: 'Not Implemented',
      description: 'The create challenge endpoint is not yet implemented.',
    },
    success: false,
    status: 'error',
    statusCode: 501,
    data: null,
  };

  return res.status(501).json(response);
});

export default createChallenge;
