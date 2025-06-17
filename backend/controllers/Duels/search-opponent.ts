import Challenge from '../../models/ChallengeModel.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import Duels from '../../models/DuelsModel.js';
import { createClient } from 'redis';
import { getSocketInstance } from '../../utils/socketHandler.js';
import { Server } from 'socket.io';

// https://chatgpt.com/c/6851bed5-54e0-800d-9f8a-8e5cf5440fdb - Solution to Race condition, dangling key solution

const searchOpponent: fn = catchAsync(async (req: any, res: any) => {
  // Process
  // 1. Get the userId from req.user and the challengeId from req.body
  // 2. Check if both are present if not return an error
  // 3. Check if someone is already searching for an opponent with same challengeId in redis
  // 4. If yes, then remove this challengeId from redis but save the state of the duel
  // 5. Save this duel to MongoDB and get the duelId
  // 6. Create a redis object with duelId and state of the duel
  // 7. Return the duelId to the user
  // 8. Also start a socket connection with duelID
  // 9. and emit a duelId on the socket with userid to the other user
  // 10. If no one is searching for an opponent, then save the challengeId in redis with the userId
  // 11. Return a success message with challengeId
});

export default searchOpponent;
