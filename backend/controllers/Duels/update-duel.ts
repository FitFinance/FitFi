import { NextFunction, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import Duels from '../../models/DuelsModel.js';
import sendResponse from '../../utils/sendResponse.js';
import { RedisClientType } from 'redis';
import getRedisClient from '../../services/redis/index.js';

const updateDuel: fn = catchAsync(
  async (req: CustomRequest, res: Response, _: NextFunction) => {
    const newVal: number | undefined = req.body.newVal;
    const duelId: number | undefined = req.body.duelId;
    const redisClient: RedisClientType<any, any> = await getRedisClient();

    if (!newVal || !duelId) {
      const errorMessage: IErrorMessage = {
        title: 'Missing Required Fields',
        description: 'Please provide both duel ID and updated value.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }
    // This shuld be done in redis instead of DB
    const duelKey: string = `duel:${duelId}`;

    const duelExists: boolean = Boolean(await redisClient.exists(duelKey));

    if (!duelExists) {
      const errorMessage: IErrorMessage = {
        title: "Duel don't exists",
        description: "The duel you are trying to update don't exists",
      };
      throw new AppError("Duel don't exists", errorMessage, 404);
    }

    const redisDuelRawData: string | null = await redisClient.sPop(duelKey);

    if (!redisDuelRawData) {
      const errorMessage: IErrorMessage = {
        title: 'Duel not found in the redis database',
        description:
          'Error while updating status of duel in Redis, duel was not found',
        context:
          'CRITICAL: This should not happen, there is some major flaw in searching opponents',
      };
      throw new AppError('Error', errorMessage, 500);
    }

    const redisDuelJSONData: any = JSON.parse(redisDuelRawData);

    if (req.user._id === redisDuelJSONData.user1) {
      redisDuelJSONData.user1Score = newVal;
    } else {
      redisDuelJSONData.user2Score = newVal;
    }

    if (
      redisDuelJSONData.user2Score > redisDuelJSONData.winningScore ||
      redisDuelJSONData.user1Score > redisDuelJSONData.winningScore
    ) {
      // Handle condition where user2 score exceeds winningScore
      // Sockets will emit stop match
      // Blockchain will handle winning logic
      // Data is permanently stored in Mongo

      const duel: IDuels | null = await Duels.findById(duelId);
      if (!duel) {
        const errorMessage: IErrorMessage = {
          title: 'Duel Not Found',
          description: 'No duel found with that ID.',
          context:
            'CRITICAL: This should never happen that means there is fault in search oponnet logic',
        };
        throw new AppError('Not Found', errorMessage, 404);
      }

      if (redisDuelJSONData.user2Score > redisDuelJSONData.winningScore) {
        // Socket emits palyer 2 won, blockchain transfer money to user2
        // Set winning player to player one
        duel.winner = redisDuelJSONData.user1;
      } else {
        // Socket emits palyer 1 won, blockchain transfer money to user2
        // Set winning player as 1
        duel.winner = redisDuelJSONData.user2;
      }

      duel.status = 'completed';

      await duel.save();
    }

    await redisClient.sAdd(duelKey, JSON.stringify(redisDuelJSONData));

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
