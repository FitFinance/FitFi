import { Request, Response } from 'express';
import Challenge from '../../models/ChallengeModel.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

const getChallenges: fn = catchAsync(async (_: Request, res: Response) => {
  const challenges: IChallenge[] = await Challenge.find({});

  if (!challenges || challenges.length === 0) {
    const response: APIResponse = {
      message: 'No challenges found',
      details: {
        title: 'Challenges Not Found',
        description: 'There are no challenges available at the moment.',
      },
      success: false,
      status: 'error',
      statusCode: 404,
      data: null,
    };
    return sendResponse(res, response);
  }

  const response: APIResponse = {
    message: 'Challenges retrieved successfully',
    details: {
      title: 'Challenges Found',
      description: 'The challenges have been successfully retrieved.',
    },
    success: true,
    status: 'success',
    statusCode: 200,
    data: {
      total: challenges.length,
      challenges,
    },
  };

  return sendResponse(res, response);
});

export default getChallenges;
