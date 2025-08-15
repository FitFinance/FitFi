// @ts-nocheck
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import HealthData from '../../models/HealthDataModel.js';
import Duels from '../../models/DuelsModel.js';

/**
 * Get health data for a specific duel
 */
const getDuelHealthData: fn = async (req: Request, res: Response) => {
  const { duelId } = req.params;
  const user: IUser = req.body.user;

  if (!duelId) {
    const response: APIResponse = {
      message: 'Duel ID is required',
      details: {
        title: 'Missing Parameter',
        description: 'Please provide a valid duel ID.',
      },
      success: false,
      status: 'error',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  try {
    // Verify user has access to this duel
    const duel: IDuels | null = await Duels.findById(duelId)
      .populate('user1', 'walletAddress username')
      .populate('user2', 'walletAddress username')
      .populate('challenge');

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

    // Get health data for both users
    const healthData = await HealthData.find({
      duel: duelId,
    })
      .populate('user', 'walletAddress username')
      .sort({ timestamp: 1 });

    // Organize data by user and data type
    const user1Data = healthData.filter(
      (data) => data.user._id.toString() === duel.user1._id.toString()
    );

    const user2Data = healthData.filter(
      (data) =>
        duel.user2 && data.user._id.toString() === duel.user2._id.toString()
    );

    // Get latest values for each data type
    const getLatestValue = (userData: any[], dataType: string) => {
      const typeData = userData.filter((d) => d.dataType === dataType);
      return typeData.length > 0 ? typeData[typeData.length - 1].value : 0;
    };

    const challengeUnit = duel.challenge.unit;
    const currentUser1Score = getLatestValue(user1Data, challengeUnit);
    const currentUser2Score = getLatestValue(user2Data, challengeUnit);

    const response: APIResponse = {
      message: 'Health data retrieved successfully',
      details: {
        title: 'Data Found',
        description: `Retrieved ${healthData.length} health data entries for duel.`,
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        duel: {
          id: duel._id,
          status: duel.status,
          challenge: duel.challenge,
          startTime: duel.duelStartTime,
          endTime: duel.duelEndTime,
          user1: duel.user1,
          user2: duel.user2,
        },
        currentScores: {
          user1Score: currentUser1Score,
          user2Score: currentUser2Score,
          challengeUnit,
          leader:
            currentUser1Score > currentUser2Score
              ? 'user1'
              : currentUser2Score > currentUser1Score
              ? 'user2'
              : 'tie',
        },
        healthData: {
          user1: user1Data.map((d) => ({
            dataType: d.dataType,
            value: d.value,
            timestamp: d.timestamp,
            source: d.source,
            isValidated: d.isValidated,
          })),
          user2: user2Data.map((d) => ({
            dataType: d.dataType,
            value: d.value,
            timestamp: d.timestamp,
            source: d.source,
            isValidated: d.isValidated,
          })),
        },
        stats: {
          totalDataPoints: healthData.length,
          user1DataPoints: user1Data.length,
          user2DataPoints: user2Data.length,
          lastUpdate: duel.lastHealthDataUpdate,
        },
      },
    };

    return sendResponse(res, response);
  } catch (error) {
    console.error('Error retrieving health data:', error);

    const response: APIResponse = {
      message: 'Internal server error',
      details: {
        title: 'Server Error',
        description: 'An error occurred while retrieving health data.',
      },
      success: false,
      status: 'error',
      statusCode: 500,
    };
    return sendResponse(res, response);
  }
};

export default getDuelHealthData;
