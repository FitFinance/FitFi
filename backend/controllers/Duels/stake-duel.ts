import { Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import AppError from '../../utils/AppError.js';
import Duels from '../../models/DuelsModel.js';
import { duelStakingService } from '../../services/DuelStakingService.js';
import { getIO } from '../../services/sockets/index.js';
import getRedisClient from '../../services/redis/index.js';
import { RedisClientType } from 'redis';

const stakeDuel: fn = catchAsync(
  async (req: CustomRequest, res: Response, _: NextFunction) => {
    const { duelId, stakeAmount, privateKey } = req.body;
    const user: IUser = req.user;
    const io = getIO();
    const redis: RedisClientType<any, any> = await getRedisClient();

    // Input validation
    if (!duelId || !stakeAmount || !privateKey) {
      const errorMessage: IErrorMessage = {
        title: 'Missing Required Fields',
        description: 'duelId, stakeAmount, and privateKey are required.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }

    // Find the duel in database
    const duel: IDuels | null = await Duels.findById(duelId)
      .populate('user1', 'walletAddress')
      .populate('user2', 'walletAddress');

    if (!duel) {
      const errorMessage: IErrorMessage = {
        title: 'Duel Not Found',
        description: 'No duel found with the provided ID.',
      };
      throw new AppError('Not Found', errorMessage, 404);
    }

    // Check if user is part of this duel
    const isUser1 = (user._id as any).toString() === (duel.user1 as any)._id.toString();
    const isUser2 = (user._id as any).toString() === (duel.user2 as any)?._id?.toString();

    if (!isUser1 && !isUser2) {
      const errorMessage: IErrorMessage = {
        title: 'Unauthorized',
        description: 'You are not a participant in this duel.',
      };
      throw new AppError('Forbidden', errorMessage, 403);
    }

    // Check if user has already staked
    const currentStakeStatus = isUser1 ? duel.user1StakeStatus : duel.user2StakeStatus;
    if (currentStakeStatus === 'staked') {
      const errorMessage: IErrorMessage = {
        title: 'Already Staked',
        description: 'You have already staked for this duel.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }

    // Check if staking window has expired
    if (duel.stakingDeadline && new Date() > duel.stakingDeadline) {
      const errorMessage: IErrorMessage = {
        title: 'Staking Window Expired',
        description: 'The staking window for this duel has expired.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }

    // Check if duel status allows staking
    if (duel.status !== 'waiting_for_stakes') {
      const errorMessage: IErrorMessage = {
        title: 'Invalid Duel Status',
        description: 'This duel is not in a state that allows staking.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }

    try {
      // Get blockchain duel ID (use MongoDB _id converted to number for Direct Commit pattern)
      const blockchainDuelId = parseInt((duel._id as any).toString().slice(-8), 16); // Use last 8 chars of MongoDB ID as number

      // Execute staking transaction on blockchain
      const txHash = await duelStakingService.stakeForDuel(
        blockchainDuelId,
        stakeAmount,
        privateKey
      );

      // Update duel in database
      const updateData: any = {
        stakeAmount: stakeAmount,
        blockchainDuelId: blockchainDuelId,
      };

      if (isUser1) {
        updateData.user1StakeStatus = 'staked';
        updateData.user1TxHash = txHash;
      } else {
        updateData.user2StakeStatus = 'staked';
        updateData.user2TxHash = txHash;
      }

      await Duels.findByIdAndUpdate(duelId, updateData);

      // Check if both users have now staked
      const updatedDuel = await Duels.findById(duelId)
        .populate('user1', 'walletAddress username')
        .populate('user2', 'walletAddress username');

      const bothStaked = updatedDuel!.user1StakeStatus === 'staked' && 
                        updatedDuel!.user2StakeStatus === 'staked';

      if (bothStaked) {
        // Both users have staked - activate the duel
        await Duels.findByIdAndUpdate(duelId, {
          status: 'accepted',
          isBlockchainActive: true
        });

        // Emit to both users that the duel is now active
        const duelRoom = `duel:${duelId}`;
        io.to(duelRoom).emit('duel_active', {
          message: 'Both users have staked! The duel is now active.',
          duel: {
            id: updatedDuel!._id,
            status: 'accepted',
            isBlockchainActive: true,
            user1StakeStatus: updatedDuel!.user1StakeStatus,
            user2StakeStatus: updatedDuel!.user2StakeStatus,
            stakeAmount: updatedDuel!.stakeAmount,
            blockchainDuelId: updatedDuel!.blockchainDuelId
          }
        });

        // Clear the staking timeout if it exists
        const timeoutKey = `duel:${duelId}:staking_timeout`;
        await redis.del(timeoutKey);

      } else {
        // Only one user has staked - notify the room
        const duelRoom = `duel:${duelId}`;
        
        io.to(duelRoom).emit('user_staked', {
          message: `${isUser1 ? 'User 1' : 'User 2'} has staked. Waiting for the other user to stake.`,
          stakedUser: isUser1 ? 'user1' : 'user2',
          txHash: txHash,
          timeRemaining: duel.stakingDeadline ? Math.max(0, duel.stakingDeadline.getTime() - Date.now()) : null
        });
      }

      const response: APIResponse = {
        success: true,
        statusCode: 200,
        status: 'success',
        message: 'Stake transaction submitted successfully',
        details: {
          title: 'Stake Successful',
          description: 'Your stake has been recorded on the blockchain.',
        },
        data: {
          txHash,
          blockchainDuelId,
          stakeAmount,
          bothStaked,
          duelStatus: bothStaked ? 'accepted' : 'waiting_for_stakes'
        }
      };

      return sendResponse(res, response);

    } catch (error) {
      console.error('Blockchain staking error:', error);
      
      // Update stake status to reflect failure
      const failureUpdate: any = {};
      if (isUser1) {
        failureUpdate.user1StakeStatus = 'pending';
      } else {
        failureUpdate.user2StakeStatus = 'pending';
      }
      await Duels.findByIdAndUpdate(duelId, failureUpdate);

      const errorMessage: IErrorMessage = {
        title: 'Staking Failed',
        description: error instanceof Error ? error.message : 'Failed to stake on blockchain',
        context: 'The transaction could not be completed. Please try again.',
      };
      throw new AppError('Internal Server Error', errorMessage, 500);
    }
  }
);

export default stakeDuel;
