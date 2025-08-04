import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import Duels from '../../models/DuelsModel.js';
import HealthData from '../../models/HealthDataModel.js';
import Challenge from '../../models/ChallengeModel.js';
import { getIO } from '../../services/sockets/index.js';
import DuelStakingService from '../../services/DuelStakingService.js';

/**
 * Start health monitoring for an active duel
 * Called after both users have staked successfully
 */
const startHealthMonitoring: fn = async (req: Request, res: Response) => {
  const { duelId, durationMinutes = 60 } = req.body;
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
    // Find the duel and verify it's ready for health monitoring
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

    // Verify both users have staked
    if (
      duel.user1StakeStatus !== 'staked' ||
      duel.user2StakeStatus !== 'staked'
    ) {
      const response: APIResponse = {
        message: 'Cannot start health monitoring',
        details: {
          title: 'Stakes Not Complete',
          description:
            'Both users must stake before health monitoring can begin.',
        },
        success: false,
        status: 'error',
        statusCode: 400,
      };
      return sendResponse(res, response);
    }

    // Check if already monitoring
    if (duel.status === 'monitoring_health') {
      const response: APIResponse = {
        message: 'Health monitoring already active',
        details: {
          title: 'Already Monitoring',
          description: 'This duel is already monitoring health data.',
        },
        success: true,
        status: 'success',
        statusCode: 200,
        data: {
          duelId: duel._id,
          startTime: duel.duelStartTime,
          endTime: duel.duelEndTime,
          duration: duel.duelDuration,
        },
      };
      return sendResponse(res, response);
    }

    // Set duel start and end times
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Update duel status to monitoring
    await Duels.findByIdAndUpdate(duelId, {
      status: 'monitoring_health',
      duelStartTime: startTime,
      duelEndTime: endTime,
      duelDuration: durationMinutes,
      healthDataCollectionStarted: true,
      user1HealthDataCount: 0,
      user2HealthDataCount: 0,
    });

    // Set up automatic duel completion
    setTimeout(async () => {
      try {
        await completeDuelAndDetermineWinner(duelId);
      } catch (error) {
        console.error('Error auto-completing duel:', error);
      }
    }, durationMinutes * 60 * 1000);

    // Emit to duel participants
    const io = getIO();
    const duelRoom = `duel:${duelId}`;

    io.to(duelRoom).emit('health_monitoring_started', {
      message: 'Health monitoring has started! Start your fitness activity.',
      duel: {
        id: duel._id,
        challenge: duel.challenge,
        startTime,
        endTime,
        duration: durationMinutes,
        participants: {
          user1: duel.user1,
          user2: duel.user2,
        },
      },
      instructions: {
        [duel.challenge
          .unit]: `Target: ${duel.challenge.target} ${duel.challenge.unit}`,
        duration: `${durationMinutes} minutes`,
        objective: 'Reach the highest score to win!',
      },
    });

    const response: APIResponse = {
      message: 'Health monitoring started successfully',
      details: {
        title: 'Monitoring Active',
        description: `Duel will run for ${durationMinutes} minutes. Start your fitness activity!`,
      },
      success: true,
      status: 'success',
      statusCode: 200,
      data: {
        duelId: duel._id,
        challenge: duel.challenge,
        startTime,
        endTime,
        duration: durationMinutes,
        target: duel.challenge.target,
        unit: duel.challenge.unit,
      },
    };

    return sendResponse(res, response);
  } catch (error) {
    console.error('Error starting health monitoring:', error);

    const response: APIResponse = {
      message: 'Internal server error',
      details: {
        title: 'Server Error',
        description: 'An error occurred while starting health monitoring.',
      },
      success: false,
      status: 'error',
      statusCode: 500,
    };
    return sendResponse(res, response);
  }
};

/**
 * Complete duel and determine winner based on health data
 */
async function completeDuelAndDetermineWinner(duelId: string) {
  try {
    console.log(`⏰ Auto-completing duel ${duelId}`);

    const duel = await Duels.findById(duelId)
      .populate('user1', 'walletAddress username')
      .populate('user2', 'walletAddress username')
      .populate('challenge');

    if (!duel || duel.status !== 'monitoring_health') {
      console.log(
        `Duel ${duelId} not in monitoring state, skipping completion`
      );
      return;
    }

    // Get final scores based on challenge unit
    const challengeUnit = duel.challenge.unit;

    // Get latest cumulative data for each user
    const user1FinalData = await HealthData.findOne({
      user: duel.user1._id,
      duel: duelId,
      dataType: challengeUnit,
    }).sort({ timestamp: -1 });

    const user2FinalData = await HealthData.findOne({
      user: duel.user2._id,
      duel: duelId,
      dataType: challengeUnit,
    }).sort({ timestamp: -1 });

    const user1FinalScore = user1FinalData ? user1FinalData.value : 0;
    const user2FinalScore = user2FinalData ? user2FinalData.value : 0;

    // Determine winner
    let winner = null;
    let winnerScore = 0;
    let loserScore = 0;

    if (user1FinalScore > user2FinalScore) {
      winner = duel.user1._id;
      winnerScore = user1FinalScore;
      loserScore = user2FinalScore;
    } else if (user2FinalScore > user1FinalScore) {
      winner = duel.user2._id;
      winnerScore = user2FinalScore;
      loserScore = user1FinalScore;
    }
    // If tie, winner remains null

    // Update duel with final results
    await Duels.findByIdAndUpdate(duelId, {
      status: 'completed',
      winner,
      user1Score: user1FinalScore,
      user2Score: user2FinalScore,
      updatedAt: new Date(),
    });

    // Settle on blockchain if both users staked
    if (duel.isBlockchainActive && duel.blockchainDuelId && winner) {
      try {
        const stakingService = new DuelStakingService();
        const winnerAddress =
          winner.toString() === duel.user1._id.toString()
            ? duel.user1.walletAddress
            : duel.user2.walletAddress;
        const loserAddress =
          winner.toString() === duel.user1._id.toString()
            ? duel.user2.walletAddress
            : duel.user1.walletAddress;

        const settlementTx = await stakingService.settleDuel(
          duel.blockchainDuelId,
          winnerAddress,
          loserAddress
        );

        await Duels.findByIdAndUpdate(duelId, {
          settlementTxHash: settlementTx.hash,
        });

        console.log(
          `✅ Duel ${duelId} settled on blockchain: ${settlementTx.hash}`
        );
      } catch (error) {
        console.error('Error settling duel on blockchain:', error);
      }
    }

    // Emit completion event
    const io = getIO();
    const duelRoom = `duel:${duelId}`;

    io.to(duelRoom).emit('duel_completed', {
      message: 'Duel completed!',
      results: {
        duelId,
        winner: winner
          ? {
              id: winner,
              score: winnerScore,
              username:
                winner.toString() === duel.user1._id.toString()
                  ? duel.user1.username
                  : duel.user2.username,
            }
          : null,
        finalScores: {
          user1: {
            id: duel.user1._id,
            username: duel.user1.username,
            score: user1FinalScore,
          },
          user2: {
            id: duel.user2._id,
            username: duel.user2.username,
            score: user2FinalScore,
          },
        },
        challenge: {
          unit: challengeUnit,
          target: duel.challenge.target,
        },
        rewards: winner
          ? 'Blockchain settlement in progress...'
          : 'Tie - stakes will be refunded',
      },
    });

    console.log(`✅ Duel ${duelId} completed. Winner: ${winner || 'Tie'}`);
  } catch (error) {
    console.error('Error completing duel:', error);
  }
}

export default startHealthMonitoring;
