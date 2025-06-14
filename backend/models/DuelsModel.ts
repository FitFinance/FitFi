import mongoose, { Model, Schema } from 'mongoose';

const duelsSchema: Schema<IDuels> = new mongoose.Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Make user2 optional
      default: null,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    status: {
      type: String,
      enum: ['searching', 'accepted', 'cancelled', 'completed', 'confirming'],
      default: 'searching',
      required: true,
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Optional, only set when the duel is completed
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Duels: Model<IDuels> = mongoose.model<IDuels>('Duels', duelsSchema);

export default Duels;
