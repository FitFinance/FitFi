// @ts-nocheck
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import HealthData from '../../models/HealthDataModel.js';
import Duels from '../../models/DuelsModel.js';
import Challenge from '../../models/ChallengeModel.js';
import { getIO } from '../../services/sockets/index.js';

/**
 * Submit health data for an active duel
 * This endpoint receives real-time health data from Health Connect
 */
const submitHealthData: fn = async (req: Request, res: Response) => {
  const { duelId, dataType, value, timestamp } = req.body;
  const user: IUser = req.body.user;

  // Validate required fields
  if (!duelId || !dataType || value === undefined || !timestamp) {
    const response: APIResponse = {
      message: 'Missing required fields',
      details: {
        title: 'Validation Error',
        description: 'duelId, dataType, value, and timestamp are required.',
      },
      success: false,
      status: 'error',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  // Validate data type
  const validDataTypes = ['steps', 'calories', 'distance', 'active_time'];
  if (!validDataTypes.includes(dataType)) {
    const response: APIResponse = {
      message: 'Invalid data type',
      details: {
        title: 'Validation Error',
        description: `dataType must be one of: ${validDataTypes.join(', ')}`,
      },
      success: false,
      status: 'error',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  try {
    // Find the duel and verify user participation
    const duel: IDuels | null = await Duels.findById(duelId)
      .populate('challenge')
      .populate('user1', 'walletAddress username')
      .populate('user2', 'walletAddress username');

    if (!duel) {
      const response: APIResponse = {
        message: 'Duel not found',
        details: {
          title: 'Invalid Duel',
          description: `No duel found with id '${duelId}'.`,
        },
        success: false,
        status: 'error',
        statusCode: 404,
      };
      return sendResponse(res, response);
    }

    // Check if user is part of this duel
    const isUser1 = duel.user1._id.toString() === user._id.toString();
    const isUser2 =
      duel.user2 && duel.user2._id.toString() === user._id.toString();

    if (!isUser1 && !isUser2) {
      const response: APIResponse = {
        message: 'Unauthorized',
        details: {
          title: 'Access Denied',
          description: 'You are not a participant in this duel.',
        },
        success: false,
        status: 'error',
        statusCode: 403,
      };
      return sendResponse(res, response);
    }

    // Check if duel is in monitoring state
    if (duel.status !== 'monitoring_health' && duel.status !== 'active') {
      const response: APIResponse = {
        message: 'Duel not accepting health data',
        details: {
          title: 'Invalid Duel State',
          description: `Duel status is '${duel.status}'. Health data can only be submitted during active duels.`,
        },
        success: false,
        status: 'error',
        statusCode: 400,
      };
      return sendResponse(res, response);
    }

    // Validate timestamp is within duel timeframe
    const submissionTime = new Date(timestamp);
    const now = new Date();

    if (duel.duelStartTime && submissionTime < duel.duelStartTime) {
      const response: APIResponse = {
        message: 'Invalid timestamp',
        details: {
          title: 'Timestamp Error',
          description:
            'Health data timestamp cannot be before duel start time.',
        },
        success: false,
        status: 'error',
        statusCode: 400,
      };
      return sendResponse(res, response);
    }

    if (duel.duelEndTime && submissionTime > duel.duelEndTime) {
      const response: APIResponse = {
        message: 'Duel ended',
        details: {
          title: 'Too Late',
          description: 'Cannot submit health data after duel end time.',
        },
        success: false,
        status: 'error',
        statusCode: 400,
      };
      return sendResponse(res, response);
    }

    // Prevent future timestamps (allow 5 minute buffer for sync delays)
    if (submissionTime > new Date(now.getTime() + 5 * 60 * 1000)) {
      const response: APIResponse = {
        message: 'Invalid timestamp',
        details: {
          title: 'Future Timestamp',
          description: 'Health data timestamp cannot be in the future.',
        },
        success: false,
        status: 'error',
        statusCode: 400,
      };
      return sendResponse(res, response);
    }

    // Check for duplicate data (same user, duel, dataType, and timestamp)
    const existingData = await HealthData.findOne({
      user: user._id,
      duel: duelId,
      dataType,
      timestamp: submissionTime,
    });

    if (existingData) {
      // Update existing data instead of creating duplicate
      existingData.value = value;
      existingData.isValidated = false; // Reset validation status
      await existingData.save();
    } else {
      // Create new health data entry
      await HealthData.create({
        user: user._id,
        duel: duelId,
        dataType,
        value,
        timestamp: submissionTime,
        source: 'health_connect',
        isValidated: false,
      });
    }

    // Update duel's health data tracking
    const updateField = isUser1
      ? 'user1HealthDataCount'
      : 'user2HealthDataCount';
    await Duels.findByIdAndUpdate(duelId, {
      lastHealthDataUpdate: now,
      $inc: { [updateField]: 1 },
    });

    // Calculate current scores for real-time updates
    const currentScores = await calculateCurrentDuelScores(
      duelId,
      duel.challenge.unit
    );

    // Emit real-time update to duel participants
    const io = getIO();
    const duelRoom = `duel:${duelId}`;

    io.to(duelRoom).emit('health_data_update', {
      user: user._id,
      dataType,
      value,
      timestamp: submissionTime,
      currentScores,
      duelStatus: duel.status,
    });

    const response: APIResponse = {
      message: 'Health data submitted successfully',
      details: {
        title: 'Data Received',
        description: `${dataType} data recorded: ${value}`,
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        dataType,
        value,
        timestamp: submissionTime,
        currentScores,
      },
    };

    return sendResponse(res, response);
  } catch (error) {
    console.error('Error submitting health data:', error);

    const response: APIResponse = {
      message: 'Internal server error',
      details: {
        title: 'Server Error',
        description: 'An error occurred while processing health data.',
      },
      success: false,
      status: 'error',
      statusCode: 500,
    };
    return sendResponse(res, response);
  }
};

/**
 * Calculate current scores for a duel based on challenge type
 */
async function calculateCurrentDuelScores(
  duelId: string,
  challengeUnit: string
) {
  try {
    const duel = await Duels.findById(duelId);
    if (!duel) return null;

    // Get the latest cumulative data for each user
    const user1Data = await HealthData.aggregate([
      {
        $match: {
          user: duel.user1,
          duel: duel._id,
          dataType: challengeUnit,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const user2Data = await HealthData.aggregate([
      {
        $match: {
          user: duel.user2,
          duel: duel._id,
          dataType: challengeUnit,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const user1Score = user1Data.length > 0 ? user1Data[0].value : 0;
    const user2Score = user2Data.length > 0 ? user2Data[0].value : 0;

    // Update duel scores
    await Duels.findByIdAndUpdate(duelId, {
      user1Score,
      user2Score,
    });

    return {
      user1Score,
      user2Score,
      leader:
        user1Score > user2Score
          ? 'user1'
          : user2Score > user1Score
          ? 'user2'
          : 'tie',
    };
  } catch (error) {
    console.error('Error calculating duel scores:', error);
    return null;
  }
}

export default submitHealthData;
