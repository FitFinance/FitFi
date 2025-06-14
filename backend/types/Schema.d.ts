import { Document } from 'mongoose';

declare global {
  interface IUser extends Document {
    walletAddress: string;
    privateKey: string;
    nonce: string;
    createdAt: Date;
    // Add other possible fields for the user schema
    username: string;
    email?: string;
    // profilePicture?: string;
    isActive?: boolean;
    lastLogin?: Date;
    role: 'user' | 'admin'; // Default role is 'user', can be 'admin'
    // roles?: string[];
  }

  interface IChallenge extends Document {
    target: number;
    unit: 'steps' | 'calories' | 'distance';
    bettingAmount: number;
    createdAt: Date;
  }
  interface IDuels extends Document {
    user1: IUser['_id'];
    user2: IUser['_id'] | null; // user2 can be null if the duel is not yet accepted
    challenge: IChallenge['_id'];
    status: 'searching' | 'accepted' | 'cancelled' | 'completed' | 'confirming'; // confirming is used when a duel is matched and waiting for confirmation
    winner: IUser['_id'] | null;
    createdAt: Date;
    updatedAt: Date;
  }
}
