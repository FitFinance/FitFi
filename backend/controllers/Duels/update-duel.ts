import { NextFunction, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import Duels from '../../models/DuelsModel.js';
import sendResponse from '../../utils/sendResponse.js';
import { RedisClientType } from 'redis';
import getRedisClient from '../../services/redis/index.js';

const updateDuel: fn = catchAsync(
  async (req: CustomRequest, res: Response, _: NextFunction) => {
    const newVal: number | undefined = req.body.newVal;
    const duelId: number | undefined = req.body.duelId;
    const redisClient: RedisClientType<any, any> = await getRedisClient();

    if (!newVal || !duelId) {
      const errorMessage: IErrorMessage = {
        title: 'Missing Required Fields',
        description: 'Please provide both duel ID and updated value.',
      };
      throw new AppError('Bad Request', errorMessage, 400);
    }
    // This shuld be done in redis instead of DB
    const duelKey: string = `duel:${duelId}`;

    const duelExists: boolean = Boolean(await redisClient.exists(duelKey));

    if (!duelExists) {
      const errorMessage: IErrorMessage = {
        title: "Duel don't exists",
        description: "The duel you are trying to update don't exists",
      };
      throw new AppError("Duel don't exists", errorMessage, 404);
    }

    const redisDuelRawData: string | null = await redisClient.sPop(duelKey);

    if (!redisDuelRawData) {
      const errorMessage: IErrorMessage = {
        title: 'Duel not found in the redis database',
        description:
          'Error while updating status of duel in Redis, duel was not found',
        context:
          'CRITICAL: This should not happen, there is some major flaw in searching opponents',
      };
      throw new AppError('Error', errorMessage, 500);
    }

    const redisDuelJSONData: any = JSON.parse(redisDuelRawData);

    if (req.user._id === redisDuelJSONData.user1) {
      redisDuelJSONData.user1Score = newVal;
    } else {
      redisDuelJSONData.user2Score = newVal;
    }

    if (
      redisDuelJSONData.user2Score > redisDuelJSONData.winningScore ||
      redisDuelJSONData.user1Score > redisDuelJSONData.winningScore
    ) {
      // Handle condition where user2 score exceeds winningScore
      // Sockets will emit stop match
      // Blockchain will handle winning logic
      // Data is permanently stored in Mongo

      const duel: IDuels | null = await Duels.findById(duelId);
      if (!duel) {
        const errorMessage: IErrorMessage = {
          title: 'Duel Not Found',
          description: 'No duel found with that ID.',
          context:
            'CRITICAL: This should never happen that means there is fault in search oponnet logic',
        };
        throw new AppError('Not Found', errorMessage, 404);
      }

      if (redisDuelJSONData.user1Score > redisDuelJSONData.winningScore) {
        // User1 won the duel
        duel.winner = redisDuelJSONData.user1;
      } else {
        // User2 won the duel  
        duel.winner = redisDuelJSONData.user2;
      }

      duel.status = 'completed';
      await duel.save();

      // Handle blockchain settlement if this is a blockchain-enabled duel
      if (duel.isBlockchainActive && duel.blockchainDuelId) {
        try {
          await handleBlockchainSettlement(duel);
        } catch (error) {
          console.error('Blockchain settlement error:', error);
          // Continue with the response even if blockchain settlement fails
          // The settlement can be retried later
        }
      }
    }

    await redisClient.sAdd(duelKey, JSON.stringify(redisDuelJSONData));

    const response: APIResponse = {
      success: true,
      statusCode: 200,
      status: 'success',
      message: 'Duel updated successfully',
      details: {
        title: 'Duel updated',
        description: '',
      },
    };
    await sendResponse(res, response);
  }
);

// Helper function to handle blockchain settlement
async function handleBlockchainSettlement(duel: IDuels) {
  try {
    // Get populated duel data
    const populatedDuel = await Duels.findById(duel._id)
      .populate('user1', 'walletAddress')
      .populate('user2', 'walletAddress')
      .populate('winner', 'walletAddress');

    if (!populatedDuel) {
      throw new Error('Duel not found for settlement');
    }

    const user1Address = (populatedDuel.user1 as any).walletAddress;
    const user2Address = (populatedDuel.user2 as any).walletAddress;
    const winnerAddress = (populatedDuel.winner as any).walletAddress;
    
    // Determine loser address
    const loserAddress = winnerAddress === user1Address ? user2Address : user1Address;

    // This would require the platform's private key for settlement
    // In production, this should be handled by a secure backend service with the platform key
    // For now, we'll update the database to indicate settlement is needed
    
    console.log(`Blockchain settlement needed for duel ${duel._id}:`);
    console.log(`  Blockchain Duel ID: ${populatedDuel.blockchainDuelId}`);
    console.log(`  Winner: ${winnerAddress}`);
    console.log(`  Loser: ${loserAddress}`);
    console.log(`  Stake Amount: ${populatedDuel.stakeAmount}`);

    // Update status to indicate settlement is pending
    await Duels.findByIdAndUpdate(duel._id, {
      status: 'completed', // Keep as completed, but add settlement tracking
      // In a real implementation, you might add a settlementStatus field
    });

    // TODO: Implement actual blockchain settlement with platform private key
    // const { duelStakingService } = await import('../../services/DuelStakingService.js');
    // const settlementTxHash = await duelStakingService.settleDuel(
    //   populatedDuel.blockchainDuelId!,
    //   winnerAddress,
    //   loserAddress,
    //   process.env.PLATFORM_PRIVATE_KEY!
    // );
    
    // await Duels.findByIdAndUpdate(duel._id, {
    //   settlementTxHash: settlementTxHash
    // });

  } catch (error) {
    console.error('Error in blockchain settlement:', error);
    throw error;
  }
}

export default updateDuel;
