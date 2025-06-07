import { Document } from 'mongoose';

declare global {
  interface IUser extends Document {
    walletAddress: string;
    nonce: string;
    createdAt: Date;
    // Add other possible fields for the user schema
    username: string;
    email?: string;
    // profilePicture?: string;
    isActive?: boolean;
    lastLogin?: Date;
    // roles?: string[];
  }
}
