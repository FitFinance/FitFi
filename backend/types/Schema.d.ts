import { Document } from 'mongoose';
import { Request } from 'express';

declare global {
  interface IUser extends Document {
    walletAddress: string;
    nonce: number;
    createdAt: Date;
    username?: string;
    email?: string;
    isActive?: boolean;
    lastLogin?: Date;
    role: 'user' | 'admin';
  }

  type ChallengeUnits = 'steps' | 'calories' | 'distance';

  interface IChallenge extends Document {
    target: number;
    unit: ChallengeUnits;
    bettingAmount: number;
    createdAt: Date;
  }
  interface IDuels extends Document {
    user1: IUser['_id'];
    user2: IUser['_id'] | null; // user2 can be null if the duel is not yet accepted
    challenge: IChallenge['_id'];
    status: 'searching' | 'accepted' | 'cancelled' | 'completed' | 'confirming'; // confirming is used when a duel is matched and waiting for confirmation
    winner: IUser['_id'] | null;
    user1Score: number;
    user2Score: number;
    createdAt: Date;
    updatedAt: Date;
  }

  interface CustomRequest extends Request {
    user: IUser;
  }
}
