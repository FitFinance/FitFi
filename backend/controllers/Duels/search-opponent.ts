import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import Challenge from '../../models/ChallengeModel.js';
import getRedisClient from '../../services/redis/index.js';
import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
import { getIO } from '../../services/sockets/index.js';
import Duels from '../../models/DuelsModel.js';

const searchOpponent: fn = async (req: Request, res: Response) => {
  const challengeId: string | undefined = req.body.challenegeId;
  const socketId: string | undefined = req.body.socketId;
  const user: IUser = req.body.user;

  const redis: RedisClientType<any, any> = await getRedisClient();
  const io: Server = getIO();

  if (!challengeId || !socketId) {
    const response: APIResponse = {
      message: 'challengeId and socketId are required',
      details: {
        title: 'Missing challengeId or socketId',
        description:
          "The 'challengeId', 'socketId' field are required in the request body.",
      },
      success: false,
      status: 'error',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  const challenge: IChallenge | null = await Challenge.findById(challengeId);

  if (!challenge) {
    const response: APIResponse = {
      message: 'Challenge not found',
      details: {
        title: 'Invalid challengeId',
        description: `No challenge found with id '${challengeId}'.`,
      },
      success: false,
      status: 'error',
      statusCode: 404,
    };
    return sendResponse(res, response);
  }

  const challengeKey: string = `challenge:${challengeId}`;
  const exists: boolean = Boolean(await redis.exists(challengeKey));

  if (!exists) {
    const duel: IDuels = await Duels.create({
      user1: user._id,
      user2: null,
      challenge: challengeId,
      status: 'searching',
      winner: null,
      createdAt: Date.now(),
      user1Score: 0,
      user2Score: 0,
    });

    const roomKey: string = `duel:${duel._id}`;

    await redis.sAdd(
      challengeKey,
      JSON.stringify({
        user1: user._id,
        user2: null,
        duelId: duel._id,
        challengeId: challengeId,
      })
    );
    io.sockets.sockets.get(socketId)?.join(`duel:${duel._id}`);

    io.to(roomKey).emit(`Hi There, you have joined room ${roomKey}`);
    io.to(roomKey).emit('confirm_match', {
      message: `You have joined room ${roomKey}, Please confirm your match, using confirm-match event`,
      duel: {
        id: duel._id,
        user1: duel.user1,
        user2: duel.user2,
        challenge: duel.challenge,
        status: duel.status,
        winner: duel.winner,
        createdAt: duel.createdAt,
        user1Score: duel.user1Score,
        user2Score: duel.user2Score,
      },
    });

    redis.hSet(`duel:${duel._id}:confirmedCount`, {
      [String(duel.user1)]: 'undefined',
      [String(duel.user2)]: 'undefined',
      count: 0,
    });
  } else {
    const duel: string | null = await redis.sPop(challengeKey);
    if (!duel) {
      const response: APIResponse = {
        message: 'No available duel found in Redis for this challenge',
        details: {
          title: 'No duel available',
          description:
            'There are no duels waiting for an opponent for this challenge.',
        },
        success: false,
        status: 'error',
        statusCode: 404,
      };
      return sendResponse(res, response);
    }
    const duelObj: any = JSON.parse(duel);
    const duelId: string = duelObj.duelId;
    const duelKey: string = `duel:${duelId}`;

    duelObj.user2 = user._id as string;

    await redis.del(`challenge:${duelObj.challengeId}`);
    await redis.sAdd(duelKey, duelObj);

    io.to(duelKey).emit('confirm-match', 'Confirm your match on metamask');
    // *************************************************************************
    // *************************************************************************
    // ***BLOCKCHAIN***
    // *************************************************************************
    // *************************************************************************
  }
};

export default searchOpponent;

// TODO: Profile page
// TODO: Active Duels - DONE
// TODO: Set expiry on challenge:challengeId and start socket events for events that could occur
