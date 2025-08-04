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
      enum: [
        'searching',
        'accepted',
        'cancelled',
        'completed',
        'confirming',
        'waiting_for_stakes',
        'staking_timeout',
        'active',
        'monitoring_health',
      ],
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
    user1Score: {
      type: Number,
      default: 0, // Default score for user1
    },
    user2Score: {
      type: Number,
      default: 0, // Default score for user2
    },
    // Blockchain integration fields
    blockchainDuelId: {
      type: Number,
      required: false, // Will be set when duel is created on blockchain
    },
    stakeAmount: {
      type: String, // Store as string to handle big numbers precisely
      required: false, // Will be set when users stake
    },
    user1StakeStatus: {
      type: String,
      enum: ['pending', 'staked', 'refunded'],
      default: 'pending',
    },
    user2StakeStatus: {
      type: String,
      enum: ['pending', 'staked', 'refunded'],
      default: 'pending',
    },
    stakingDeadline: {
      type: Date,
      required: false, // 1-minute deadline for both users to stake
    },
    user1TxHash: {
      type: String,
      required: false, // Transaction hash for user1's stake
    },
    user2TxHash: {
      type: String,
      required: false, // Transaction hash for user2's stake
    },
    settlementTxHash: {
      type: String,
      required: false, // Transaction hash for duel settlement
    },
    isBlockchainActive: {
      type: Boolean,
      default: false, // True when both users have staked and duel is active on blockchain
    },
    // Health monitoring fields
    duelDuration: {
      type: Number, // Duration in minutes
      default: 60,
    },
    healthDataCollectionStarted: {
      type: Boolean,
      default: false,
    },
    lastHealthDataUpdate: {
      type: Date,
      default: null,
    },
    user1HealthDataCount: {
      type: Number,
      default: 0,
    },
    user2HealthDataCount: {
      type: Number,
      default: 0,
    },
    duelStartTime: {
      type: Date,
      default: null,
    },
    duelEndTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

duelsSchema.index({
  user1: 1,
  user2: 1,
});

const Duels: Model<IDuels> = mongoose.model<IDuels>('Duels', duelsSchema);

export default Duels;
