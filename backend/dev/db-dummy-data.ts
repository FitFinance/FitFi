import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Challenge from '../models/ChallengeModel.js';
import User from '../models/UserModel.js';
import Duels from '../models/DuelsModel.js';

dotenv.config({
  path: ['../.env', '../secret.env'],
});

const users: Partial<IUser>[] = [
  {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    nonce: 871263,
    createdAt: new Date(),
    username: 'Arnav',
    role: 'user',
  },
  {
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    nonce: 123456,
    createdAt: new Date(),
    username: 'Alice',
    role: 'user',
  },
  {
    walletAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    nonce: 654321,
    createdAt: new Date(),
    username: 'Bob',
    role: 'user',
  },
];

const challenges: Partial<IChallenge>[] = [
  {
    target: 10000,
    unit: 'steps',
    bettingAmount: 10,
    createdAt: new Date(),
  },
  {
    target: 500,
    unit: 'calories',
    bettingAmount: 5,
    createdAt: new Date(),
  },
];

(async () => {
  // Connect to MongoDB
  const mongooseURI: string =
    process.env.MONGOOSE_URI || 'mongodb://localhost:27017/fitfi';
  const db: mongoose.Mongoose = await mongoose.connect(mongooseURI);
  if (!db) {
    console.error('Failed to connect to MongoDB');
    process.exit(1);
  }
  console.log('Connected to MongoDB successfully.');
  try {
    // Clear existing data
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await Duels.deleteMany({});

    // Insert dummy users
    const insertedUsers: Partial<IUser>[] = await User.insertMany(users);
    console.log('Dummy users created:', insertedUsers);

    // Insert dummy challenges
    const insertedChallenges: Partial<IChallenge>[] =
      await Challenge.insertMany(challenges);
    console.log('Dummy challenges created:', insertedChallenges);
  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
})();
