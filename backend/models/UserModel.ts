// import { IUser } from '../types/Schema.js';
import mongoose, { Model, Schema } from 'mongoose';

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
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
    username: {
      type: String,
      required: false, // required only for username/password flow
      unique: true,
      sparse: true, // allow users created only with wallet flow
      minlength: 3,
      maxlength: 40,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false, // only for users who registered with username/password
      select: false,
    },
    signupAppVersion: {
      type: String,
      required: false,
    },
    lastLoginAppVersion: {
      type: String,
      required: false,
    },
    firstLoginAt: {
      type: Date,
      required: false,
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
  },
  {
    timestamps: false,
  }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
