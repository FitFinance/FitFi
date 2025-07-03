import chalk from 'chalk';
import './utils/console-color.js';
import './utils/setup-env.js';
import app from './app.js';
import './utils/connect-db.js';
import { createServer, Server as HttpServer } from 'node:http';
import { initiateSocket, getIO } from './services/sockets/index.js';
import { duelStakingService } from './services/DuelStakingService.js';
import Duels from './models/DuelsModel.js';

const PORT: number = Number(process.env?.PORT) || 3000;

const httpServer: HttpServer = createServer(app);
initiateSocket(httpServer);

// Setup blockchain event listeners
setupBlockchainEventListeners();

// Setup blockchain event monitoring
function setupBlockchainEventListeners() {
  console.log(chalk.bgBlue.white(' BLOCKCHAIN ') + chalk.cyan(' Setting up event listeners...'));
  
  duelStakingService.setupEventListeners({
    onStakePlaced: async (event) => {
      console.log(chalk.bgGreen.black(' STAKE ') + ` User ${event.user} staked ${event.amount} for duel ${event.duelId}`);
      
      try {
        // Find the duel by blockchain ID
        const duel = await Duels.findOne({ blockchainDuelId: Number(event.duelId) })
          .populate('user1', 'walletAddress')
          .populate('user2', 'walletAddress');

        if (duel) {
          const isUser1 = (duel.user1 as any).walletAddress.toLowerCase() === event.user.toLowerCase();
          const isUser2 = (duel.user2 as any).walletAddress.toLowerCase() === event.user.toLowerCase();

          if (isUser1 || isUser2) {
            // Emit real-time update to the duel room
            const io = getIO();
            const duelRoom = `duel:${duel._id}`;
            
            io.to(duelRoom).emit('stake_confirmed', {
              message: `Stake confirmed on blockchain`,
              user: isUser1 ? 'user1' : 'user2',
              amount: event.amount.toString(),
              txConfirmed: true
            });
          }
        }
      } catch (error) {
        console.error('Error handling StakePlaced event:', error);
      }
    },

    onDuelSettled: async (event) => {
      console.log(chalk.bgYellow.black(' SETTLED ') + ` Duel ${event.duelId} settled. Winner: ${event.winner}`);
      
      try {
        // Find and update the duel
        const duel = await Duels.findOne({ blockchainDuelId: Number(event.duelId) });
        if (duel) {
          // The settlement transaction hash should be captured during the settlement call
          // This event confirms the settlement was successful
          
          const io = getIO();
          const duelRoom = `duel:${duel._id}`;
          
          io.to(duelRoom).emit('duel_settled', {
            message: 'Duel has been settled on blockchain',
            winner: event.winner,
            winnerShare: event.winnerShare.toString(),
            platformShare: event.platformShare.toString(),
            loserShare: event.loserShare.toString(),
            settled: true
          });
        }
      } catch (error) {
        console.error('Error handling DuelSettled event:', error);
      }
    },

    onStakeRefunded: async (event) => {
      console.log(chalk.bgRed.white(' REFUND ') + ` Stake refunded to ${event.user} for duel ${event.duelId}`);
      
      try {
        // Find the duel and emit refund confirmation
        const duel = await Duels.findOne({ blockchainDuelId: Number(event.duelId) });
        if (duel) {
          const io = getIO();
          const duelRoom = `duel:${duel._id}`;
          
          io.to(duelRoom).emit('stake_refunded', {
            message: 'Stake has been refunded',
            user: event.user,
            amount: event.amount.toString(),
            refunded: true
          });
        }
      } catch (error) {
        console.error('Error handling StakeRefunded event:', error);
      }
    }
  });
}

httpServer.listen(PORT, () => {
  console.log(
    chalk.bgGreen.black(' SUCCESS ') +
      chalk.bold.cyan(' App is listening on ') +
      chalk.bold.rgb(233, 8, 233).underline(`http://localhost:${PORT}`) +
      chalk.bold.gray(` [${process.env.NODE_ENV || 'development'} mode]`)
  );
});

process.on('SIGINT', () => {
  console.log(
    chalk.bgYellow.black(' SHUTDOWN ') +
      chalk.bold.red(' Gracefully shutting down...')
  );

  process.exit(0);
});
