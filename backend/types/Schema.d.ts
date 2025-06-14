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
    amount: number;
    unit: 'Steps' | 'Calories' | 'Distance';
    target: number;
  }
}
