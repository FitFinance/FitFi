// @ts-nocheck
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import Duels from '../../models/DuelsModel.js';

/**
 * Get active duels for the authenticated user
 */
const getActiveDuels: fn = async (req: Request, res: Response) => {
  const user: IUser = req.body.user;

  try {
    // Find all duels where the user is a participant and status is not completed/cancelled
    const activeDuels = await Duels.find({
      $or: [{ user1: user._id }, { user2: user._id }],
      status: {
        $in: [
          'searching',
          'accepted',
          'waiting_for_stakes',
          'confirming',
          'active',
          'monitoring_health',
        ],
      },
    })
      .populate('user1', 'walletAddress username')
      .populate('user2', 'walletAddress username')
      .populate('challenge')
      .sort({ createdAt: -1 });

    // Transform duels to match mobile app expectations
    const transformedDuels = activeDuels.map((duel) => {
      const isUser1 = duel.user1._id.toString() === user._id.toString();
      const opponent = isUser1 ? duel.user2 : duel.user1;

      // Determine display status
      let displayStatus = 'Waiting';
      if (duel.status === 'monitoring_health') {
        displayStatus = 'Live';
      } else if (duel.status === 'accepted' && duel.isBlockchainActive) {
        displayStatus = 'Ready to Start';
      } else if (duel.status === 'waiting_for_stakes') {
        displayStatus = 'Staking';
      } else if (duel.status === 'searching') {
        displayStatus = 'Finding Opponent';
      }

      // Calculate time remaining
      let timeLeft = 'N/A';
      if (duel.duelEndTime) {
        const remaining = Math.max(
          0,
          new Date(duel.duelEndTime).getTime() - Date.now()
        );
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        timeLeft = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        if (remaining <= 0) {
          timeLeft = 'Ended';
        }
      } else if (duel.stakingDeadline && duel.status === 'waiting_for_stakes') {
        const remaining = Math.max(
          0,
          new Date(duel.stakingDeadline).getTime() - Date.now()
        );
        const seconds = Math.floor(remaining / 1000);
        timeLeft = `${Math.floor(seconds / 60)}:${(seconds % 60)
          .toString()
          .padStart(2, '0')}`;
      }

      return {
        id: duel._id,
        opponent: opponent
          ? opponent.username || `User ${opponent.walletAddress?.slice(-6)}`
          : 'Finding...',
        status: displayStatus,
        yourSteps: isUser1 ? duel.user1Score : duel.user2Score,
        opponentSteps: isUser1 ? duel.user2Score : duel.user1Score,
        timeLeft,
        stake: `${duel.challenge.bettingAmount} FITFI`,
        challenge: {
          unit: duel.challenge.unit,
          target: duel.challenge.target,
          bettingAmount: duel.challenge.bettingAmount,
        },
        duelStatus: duel.status,
        isBlockchainActive: duel.isBlockchainActive,
        stakingStatus: {
          user1: duel.user1StakeStatus,
          user2: duel.user2StakeStatus,
        },
      };
    });

    const response: APIResponse = {
      message: 'Active duels retrieved successfully',
      details: {
        title: 'Active Duels',
        description: `Found ${transformedDuels.length} active duels.`,
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: transformedDuels,
    };

    return sendResponse(res, response);
  } catch (error) {
    console.error('Error retrieving active duels:', error);

    const response: APIResponse = {
      message: 'Internal server error',
      details: {
        title: 'Server Error',
        description: 'An error occurred while retrieving active duels.',
      },
      success: false,
      status: 'error',
      statusCode: 500,
    };
    return sendResponse(res, response);
  }
};

export default getActiveDuels;
