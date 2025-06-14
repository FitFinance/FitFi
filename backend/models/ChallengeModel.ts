import mongoose, { Model, Schema } from 'mongoose';

const challengeSchema: Schema<IChallenge> = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ['steps', 'calories', 'distance'],
  },
  target: {
    type: Number,
    required: true,
  },
});

const Challenge: Model<IChallenge> = mongoose.model<IChallenge>(
  'Challenge',
  challengeSchema
);

export default Challenge;
