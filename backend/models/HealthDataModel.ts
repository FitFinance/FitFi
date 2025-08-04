import mongoose, { Model, Schema } from 'mongoose';

const healthDataSchema: Schema<IHealthData> = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duel: {
    type: Schema.Types.ObjectId,
    ref: 'Duels',
    required: true,
  },
  dataType: {
    type: String,
    enum: ['steps', 'calories', 'distance', 'active_time'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  source: {
    type: String,
    enum: ['health_connect', 'manual', 'apple_health'],
    default: 'health_connect',
  },
  isValidated: {
    type: Boolean,
    default: false,
  },
  validationTimestamp: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
healthDataSchema.index({ user: 1, duel: 1, dataType: 1, timestamp: 1 });
healthDataSchema.index({ duel: 1, timestamp: 1 });

const HealthData: Model<IHealthData> = mongoose.model<IHealthData>(
  'HealthData',
  healthDataSchema
);

export default HealthData;
