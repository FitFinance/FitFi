import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import Duels from '../../models/DuelsModel.js';
import sendResponse from '../../utils/sendResponse.js';

const updateDuel: fn = catchAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const newVal: number | undefined = req.body.newVal;
    const duelId: number | undefined = req.body.duelId;

    if (!newVal || !duelId) {
      const errorMessage: IErrorMessage = {
        title: 'Missing Required Fields',
        description: 'Please provide both duel ID and updated value.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }

    const duel: IDuels | null = await Duels.findById(duelId);
    if (!duel) {
      const errorMessage: IErrorMessage = {
        title: 'Duel Not Found',
        description: 'No duel found with that ID.',
      };
      throw new AppError('Not Found', errorMessage, 404);
    }

    if (duel.user1 == (req as any).user._id) {
      duel.user1Score = newVal;
    } else if (duel.user2 == (req as any).user._id) {
      duel.user2Score = newVal;
    } else {
      const errorMessage: IErrorMessage = {
        title: 'Forbidden',
        description: 'You do not have permission to update this duel.',
      };
      throw new AppError('Access Denied', errorMessage, 403);
    }

    await duel.save();
    const response: APIResponse = {
      success: true,
      statusCode: 200,
      status: 'success',
      message: 'Duel updated successfully',
      details: {
        title: 'Duel updated',
        description: '',
      },
    };
    await sendResponse(res, response);
  }
);

export default updateDuel;
