import { Response } from 'express';

async function sendResponse(res: Response, response: APIResponse) {
  res.status(response.statusCode || 204).json(response);
}

export default sendResponse;
