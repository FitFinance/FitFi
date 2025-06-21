import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import Challenge from '../../models/ChallengeModel.js';
import sendResponse from '../../utils/sendResponse.js';

const createChallenge: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const unit: ChallengeUnits | undefined = req.body.unit;
    const target: number | undefined = req.body.target;
    const bettingAmount: number | undefined = req.body.bettingAmount;

    if (!unit || !target || !bettingAmount) {
      return next(
        new AppError(
          'Insufficient data',
          {
            title: 'Missing Required Challenge Data',
            description:
              "Please provide all required fields: 'target', 'bettingAmount', and 'unit'.",
            context: {
              missingFields: [
                !unit ? "'unit'" : null,
                !target ? "'target'" : null,
                !bettingAmount ? "'bettingAmount'" : null,
              ].filter(Boolean),
              received: {
                unit: unit ?? 'Not Provided',
                target: target ?? 'Not Provided',
                bettingAmount: bettingAmount ?? 'Not Provided',
              },
            },
          },
          400
        )
      );
    }

    const challenege: IChallenge = await Challenge.create({
      unit,
      target,
      bettingAmount,
    });

    const response: APIResponse = {
      message: 'Challenge created successfully.',
      details: {
        title: 'Challenge Created',
        description:
          'The challenge has been created and saved to the database.',
      },
      success: true,
      statusCode: 201,
      status: 'success',
      data: {
        challenege,
      },
    };
    sendResponse(res, response);
  }
);

export default createChallenge;
