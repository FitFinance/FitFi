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
  const isSomeoneSearching: boolean = Boolean(await redis.exists(challengeKey));

  if (!isSomeoneSearching) {
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
    // const redisDuel: { [key: string]: string | number } = {
    //   user1: String(user._id),
    //   user2: '',
    //   challenge: String(challengeId),
    //   status: 'searching',
    //   winner: '',
    //   user1Score: 0,
    //   user2Score: 0,
    // };

    const roomKey: string = `duel:${duel._id}`;
    // await redis.hSet(`duel:${duel._id}`, redisDuel);

    await redis.sAdd(
      challengeKey,
      JSON.stringify({
        user1: user._id,
        user2: null,
        duelId: duel._id,
        winningScore: challenge.target,
        challengeId: challengeId,
        user1Score: 0, // These both are added as they are required to create final duel object also
        user2Score: 0,
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
  const duel: string | null = (await (redis as any).sPop(challengeKey)) as string | null;
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

    // Update duel with second user and start blockchain integration
    await Duels.findByIdAndUpdate(duelId, {
      user2: user._id,
      status: 'waiting_for_stakes',
      stakingDeadline: new Date(Date.now() + 60000), // 1 minute from now
      stakeAmount: process.env.DEFAULT_STAKE_AMOUNT || '1000000000000000000' // 1 ETH default
    });

    duelObj.user2 = user._id as string;

    await redis.del(`challenge:${duelObj.challengeId}`);
    await redis.sAdd(duelKey, JSON.stringify(duelObj));

    // Join both users to the duel room
    io.sockets.sockets.get(socketId)?.join(duelKey);

    // Emit match found event to start staking phase
    io.to(duelKey).emit('match_found_start_staking', {
      message: 'Match found! Both users have 1 minute to stake their tokens.',
      duel: {
        id: duelId,
        user1: duelObj.user1,
        user2: user._id,
        challenge: duelObj.challengeId,
        status: 'waiting_for_stakes',
        stakingDeadline: Date.now() + 60000, // 1 minute
        stakeAmount: process.env.DEFAULT_STAKE_AMOUNT || '1000000000000000000',
        blockchainDuelId: parseInt(duelId.slice(-8), 16) // Use last 8 chars of MongoDB ID as blockchain ID
      },
      stakingWindow: 60000 // 1 minute in milliseconds
    });

    // Set up staking timeout
    const timeoutKey = `duel:${duelId}:staking_timeout`;
    await redis.setEx(timeoutKey, 60, 'timeout'); // 60 seconds

    // Set timeout for handling incomplete stakes
    setTimeout(async () => {
      try {
        const timeoutExists = await redis.exists(timeoutKey);
        if (timeoutExists) {
          // Staking window expired - handle timeout
          const expiredDuel = await Duels.findById(duelId)
            .populate('user1', 'walletAddress')
            .populate('user2', 'walletAddress');

          if (expiredDuel && expiredDuel.status === 'waiting_for_stakes') {
            const user1Staked = expiredDuel.user1StakeStatus === 'staked';
            const user2Staked = expiredDuel.user2StakeStatus === 'staked';

            if (!user1Staked && !user2Staked) {
              // Neither user staked - cancel duel
              await Duels.findByIdAndUpdate(duelId, {
                status: 'staking_timeout'
              });

              io.to(duelKey).emit('duel_cancelled', {
                message: 'Duel cancelled - neither user staked within the time limit.',
                reason: 'staking_timeout'
              });

            } else if (user1Staked && !user2Staked) {
              // Only user1 staked - refund user1
              await handlePartialStakeRefund(expiredDuel, 'user1', duelKey, io);

            } else if (!user1Staked && user2Staked) {
              // Only user2 staked - refund user2
              await handlePartialStakeRefund(expiredDuel, 'user2', duelKey, io);
            }
            // If both staked, this timeout is irrelevant as duel is already active

            await redis.del(timeoutKey);
          }
        }
      } catch (error) {
        console.error('Error handling staking timeout:', error);
      }
    }, 60000); // 1 minute

    const response: APIResponse = {
      message: 'Match found! Staking phase initiated.',
      details: {
        title: 'Match Found',
        description: 'You have been matched with an opponent. Both users must stake within 1 minute.',
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        duelId,
        opponent: duelObj.user1,
        stakingDeadline: Date.now() + 60000,
        stakeAmount: process.env.DEFAULT_STAKE_AMOUNT || '1000000000000000000'
      }
    };

    return sendResponse(res, response);
  }
};

// Helper function to handle partial stake refunds
async function handlePartialStakeRefund(duel: IDuels, stakedUser: 'user1' | 'user2', duelKey: string, io: any) {
  try {
    // In production, this should be done through a secure backend service
    // For now, we'll just update the database status
    
    await Duels.findByIdAndUpdate(duel._id, {
      status: 'staking_timeout',
      [`${stakedUser}StakeStatus`]: 'refunded'
    });

    io.to(duelKey).emit('duel_cancelled', {
      message: `Duel cancelled - only one user staked. Refund will be processed.`,
      reason: 'partial_stake_timeout',
      refundUser: stakedUser
    });

    console.log(`Refund needed for ${stakedUser} in duel ${duel._id}`);
    
  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

export default searchOpponent;

// TODO: Profile page
// TODO: Active Duels - DONE
// TODO: Set expiry on challenge:challengeId and start socket events for events that could occur
