// import { IUser } from '../types/Schema.js';
import mongoose, { Model, Schema } from 'mongoose';

const userSchema: Schema<IUser> = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  nonce: {
    type: String,
    required: true,
    default: () => Math.floor(Math.random() * 1000000).toString(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: false,
    unique: false, // walletAddress is already unique so no need to make this uique
  },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
