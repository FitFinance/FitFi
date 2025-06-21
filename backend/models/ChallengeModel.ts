import mongoose, { Model, Schema } from 'mongoose';

const challengeSchema: Schema<IChallenge> = new mongoose.Schema({
  unit: {
    type: String,
    required: true,
    enum: ['steps', 'calories', 'distance'],
  },
  target: {
    type: Number,
    required: true,
  },
  bettingAmount: {
    // from each player
    // if bettingAmount is 10, then each player bets 10
    // value of bettingAmount is 10
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Challenge: Model<IChallenge> = mongoose.model<IChallenge>(
  'Challenge',
  challengeSchema
);

export default Challenge;
