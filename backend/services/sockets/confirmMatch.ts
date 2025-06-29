import { Server, Socket } from 'socket.io';
import catchAsyncSockets from '../../utils/catchAsyncSockets.js';
import { RedisClientType } from 'redis';

import getRedisClient from '../redis/index.js';
import Duels from '../../models/DuelsModel.js';

const confirmMatch: socketFn = catchAsyncSockets(
  async (io: Server, socket: Socket) => {
    const userId: string = (socket as any).userId;
    const duelId: string | string[] | undefined = socket.handshake.query.duelId;
    const answer: string | string[] | undefined = socket.handshake.query.answer;

    const redisClient: RedisClientType<any, any> = await getRedisClient();
    if (typeof duelId != 'string') {
      socket.emit('error', {
        message: 'matchId is needed to confirm a match',
      });
      return;
    }

    if (typeof answer != 'string' || (answer !== 'yes' && answer !== 'no')) {
      socket.emit('error', {
        message: 'Invalid answer please send yes or no',
      });
      return;
    }

    // Store the user's answer
    await redisClient.hSet(`duel:${duelId}:confirmedCount`, userId, answer);

    // Set a 30 seconds timer to auto-cancel if not already set
    const timerKey: string = `duel:${duelId}:confirmationTimer`;
    const timerExists: string | null = await redisClient.get(timerKey);
    if (!timerExists) {
      // Set a timer key with 5 min expiry
      await redisClient.set(timerKey, '1', { EX: 300 });
      // Schedule a check in 5 minutes (using Redis key expiry event or polling)
      setTimeout(async () => {
        const confirmData: Record<string, string> = await redisClient.hGetAll(
          `duel:${duelId}:confirmedCount`
        );
        const confirmUserIds: string[] = Object.keys(confirmData).filter(
          (k: string) => k !== 'count'
        );
        if (confirmUserIds.length < 2) {
          // Not both users have answered, cancel duel
          await Duels.findByIdAndUpdate(duelId, { status: 'cancelled' });
          await redisClient.del(`duel:${duelId}:confirmedCount`);
          await redisClient.del(timerKey);
          io.to(duelId as string).emit('confirmation', {
            message:
              'Duel cancelled due to no response from both users in time',
            confirm: 'no',
          });
        }
      }, 30000); // 30 seconds
    }

    // Get all users who have answered
    const updated: Record<string, string> = await redisClient.hGetAll(
      `duel:${duelId}:confirmedCount`
    );
    const userIds: string[] = Object.keys(updated).filter(
      (k: string) => k !== 'count'
    );

    // Find the other user (assuming only 2 users per duel)
    const otherUserId: string | undefined = userIds.find(
      (id: string) => id !== userId
    );
    const otherUserAnswer: string | undefined = otherUserId
      ? updated[otherUserId]
      : undefined;

    // If only one user has answered, send confirmation event
    if (!otherUserAnswer) {
      io.to(socket.handshake.query.duelId as string).emit('confirmation', {
        message: `${userId} has confirmed the match`,
        confirm: answer,
      });
      // If the answer is 'no', update duel status to 'cancelled' in MongoDB and remove from Redis
      if (answer === 'no') {
        await Duels.findByIdAndUpdate(duelId, { status: 'cancelled' });
        await redisClient.del(`duel:${duelId}:confirmedCount`);
      }
      return;
    }

    // If both have answered
    if (answer === 'yes' && otherUserAnswer === 'yes') {
      // Both accepted, update status to 'accepted'
      await Duels.findByIdAndUpdate(duelId, { status: 'accepted' });
    } else if (answer === 'no' || otherUserAnswer === 'no') {
      // If either said no, cancel the duel and remove from Redis
      await Duels.findByIdAndUpdate(duelId, { status: 'cancelled' });
      await redisClient.del(`duel:${duelId}:confirmedCount`);
    }
  }
);

export default confirmMatch;
