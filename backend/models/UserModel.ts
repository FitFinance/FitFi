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
    type: Number,
    required: true,
    default: () => Math.floor(Math.random() * 1000000),
  },
  name: {
    type: String,
    required: false,
    default: 'Anonymous',
    maxlength: 50,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user',
  },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
