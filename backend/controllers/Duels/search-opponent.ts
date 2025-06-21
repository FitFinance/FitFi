import { Request, Response } from 'express';
import Challenge from '../../models/ChallengeModel.js';
import Duels from '../../models/DuelsModel.js';
import sendResponse from '../../utils/sendResponse.js';
import redisClient from '../../utils/redisClient.js';
import { getSocketInstance } from '../../utils/socketHandler.js';

// TTL for Redis entries: 2 days in seconds
const SEARCH_TTL: number = 2 * 24 * 60 * 60;

type DuelData = {
  user1: string;
  user2: string | null;
  challenge: string;
  status: 'searching' | 'confirming';
  winner?: string | null;
  user1Score?: number;
  user2Score?: number;
  createdAt: Date;
  updatedAt: Date;
};

const searchOpponent: fn = async (req: Request, res: Response) => {};

export default searchOpponent;
