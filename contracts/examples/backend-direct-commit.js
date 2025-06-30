// Backend Integration for FitFi Direct Commit Approach
// This example shows how to integrate the gas-efficient DuelStaking contract

import { ethers } from "ethers";
import EventEmitter from "events";

// Contract ABI (import from deployments)
const DuelStakingABI = [
  "function stakeForDuel(uint256 duelId) external payable",
  "function settleDuel(uint256 duelId, address winner, address loser) external",
  "function refundStake(uint256 duelId, address user) external",
  "function getStake(uint256 duelId, address user) external view returns (uint256)",
  "function getTotalDuelStakes(uint256 duelId, address user1, address user2) external view returns (uint256)",
  "function platformAddress() external view returns (address)",
  "function owner() external view returns (address)",
  "event StakePlaced(uint256 indexed duelId, address indexed user, uint256 amount)",
  "event DuelSettled(uint256 indexed duelId, address winner, address loser, uint256 winnerShare, uint256 platformShare, uint256 loserShare)",
  "event StakeRefunded(uint256 indexed duelId, address indexed user, uint256 amount)"
];

// Network configurations
const NETWORKS = {
  core_testnet: {
    rpc: "https://rpc.test.btcs.network",
    chainId: 1115,
    contractAddress: "0xD6D0F20D055748302877a2a635a22F5dD0d0433D"
  },
  core_testnet_2: {
    rpc: "https://rpc.test2.btcs.network",
    chainId: 1114,
    contractAddress: "0x8796071429e599a1ec631258dF4aEceA18cB9F69"
  }
};

/**
 * FitFi Direct Commit Backend Service
 * Handles matchmaking, settlement, and refunds using the gas-efficient approach
 */
class FitFiBackendService extends EventEmitter {
  constructor(network = "core_testnet_2", ownerPrivateKey) {
    super();
    
    this.network = NETWORKS[network];
    this.provider = new ethers.JsonRpcProvider(this.network.rpc);
    this.owner = new ethers.Wallet(ownerPrivateKey, this.provider);
    this.contract = new ethers.Contract(
      this.network.contractAddress,
      DuelStakingABI,
      this.provider
    );
    
    // Duel state management
    this.activeDuels = new Map();
    this.duelTimeouts = new Map();
    
    // Constants
    this.STAKING_TIMEOUT = 300000; // 5 minutes for both users to stake
    this.DUEL_TIMEOUT = 1800000;   // 30 minutes for fitness activity
    
    console.log("🚀 FitFi Backend Service Initialized");
    console.log("   Network:", network);
    console.log("   Contract:", this.network.contractAddress);
    console.log("   Owner:", this.owner.address);
  }

  /**
   * Initialize event listeners for real-time contract monitoring
   */
  async initialize() {
    console.log("🔍 Setting up contract event listeners...");
    
    // Listen for stake events
    this.contract.on("StakePlaced", (duelId, user, amount, event) => {
      this.handleStakePlaced(duelId, user, amount, event);
    });
    
    // Listen for settlement events
    this.contract.on("DuelSettled", (duelId, winner, loser, winnerShare, platformShare, loserShare, event) => {
      this.handleDuelSettled(duelId, winner, loser, winnerShare, platformShare, loserShare, event);
    });
    
    // Listen for refund events
    this.contract.on("StakeRefunded", (duelId, user, amount, event) => {
      this.handleStakeRefunded(duelId, user, amount, event);
    });
    
    console.log("✅ Event listeners active");
    
    // Verify contract connectivity
    const owner = await this.contract.owner();
    const platform = await this.contract.platformAddress();
    
    console.log("📋 Contract Status:");
    console.log("   Owner:", owner);
    console.log("   Platform:", platform);
    console.log("   Owner Match:", owner.toLowerCase() === this.owner.address.toLowerCase());
  }

  /**
   * Create a new fitness duel
   * Direct Commit Approach: Simple duel creation with timeout management
   */
  async createDuel(user1Address, user2Address, stakeAmount) {
    const duelId = this.generateDuelId();
    
    const duel = {
      id: duelId,
      user1: user1Address,
      user2: user2Address,
      requiredStake: stakeAmount,
      stakes: {
        [user1Address]: 0,
        [user2Address]: 0
      },
      status: "waiting_for_stakes",
      createdAt: Date.now(),
      stakingDeadline: Date.now() + this.STAKING_TIMEOUT
    };
    
    this.activeDuels.set(duelId, duel);
    
    // Set timeout for staking phase
    const timeout = setTimeout(() => {
      this.handleStakingTimeout(duelId);
    }, this.STAKING_TIMEOUT);
    
    this.duelTimeouts.set(duelId, timeout);
    
    console.log(`⚔️ Duel created: ${duelId}`);
    console.log(`   Users: ${user1Address} vs ${user2Address}`);
    console.log(`   Stake: ${ethers.formatEther(stakeAmount)} CORE each`);
    
    this.emit("duelCreated", duel);
    return duel;
  }

  /**
   * Handle stake placed events from the blockchain
   * Direct Commit Benefit: Immediate stake confirmation
   */
  async handleStakePlaced(duelId, user, amount, event) {
    console.log(`💰 Stake placed: Duel ${duelId}, User ${user}, Amount ${ethers.formatEther(amount)} CORE`);
    
    const duel = this.activeDuels.get(Number(duelId));
    if (!duel) {
      console.log(`⚠️ Unknown duel: ${duelId}`);
      return;
    }
    
    // Update stake tracking
    duel.stakes[user] = amount;
    
    // Check if both users have staked
    const user1Staked = duel.stakes[duel.user1] > 0;
    const user2Staked = duel.stakes[duel.user2] > 0;
    
    if (user1Staked && user2Staked) {
      console.log(`🎯 Both users staked for duel ${duelId}`);
      
      // Clear staking timeout
      const timeout = this.duelTimeouts.get(Number(duelId));
      if (timeout) {
        clearTimeout(timeout);
        this.duelTimeouts.delete(Number(duelId));
      }
      
      // Start fitness phase
      await this.startFitnessPhase(duel);
    }
    
    this.emit("stakeReceived", { duelId, user, amount, duel });
  }

  /**
   * Start the fitness activity phase
   * Direct Commit Approach: Simple state transition
   */
  async startFitnessPhase(duel) {
    duel.status = "fitness_active";
    duel.fitnessStartTime = Date.now();
    duel.fitnessDeadline = Date.now() + this.DUEL_TIMEOUT;
    
    console.log(`🏃‍♂️ Fitness phase started for duel ${duel.id}`);
    
    // Set timeout for fitness completion
    const timeout = setTimeout(() => {
      this.handleFitnessTimeout(duel.id);
    }, this.DUEL_TIMEOUT);
    
    this.duelTimeouts.set(duel.id, timeout);
    
    this.emit("fitnessPhaseStarted", duel);
  }

  /**
   * Submit fitness results and trigger settlement
   * Direct Commit Benefit: Single settlement transaction
   */
  async submitFitnessResults(duelId, user1Data, user2Data) {
    const duel = this.activeDuels.get(duelId);
    if (!duel || duel.status !== "fitness_active") {
      throw new Error(`Invalid duel state: ${duelId}`);
    }
    
    console.log(`📊 Processing fitness results for duel ${duelId}`);
    
    // Determine winner (example logic)
    const winner = this.determineWinner(user1Data, user2Data);
    const loser = winner === duel.user1 ? duel.user2 : duel.user1;
    
    console.log(`🏆 Winner determined: ${winner}`);
    
    // Settle duel on blockchain
    await this.settleDuel(duelId, winner, loser);
    
    return { winner, loser, user1Data, user2Data };
  }

  /**
   * Settle duel on blockchain
   * Direct Commit Approach: Gas-efficient single transaction
   */
  async settleDuel(duelId, winner, loser) {
    console.log(`⚖️ Settling duel ${duelId}: ${winner} beats ${loser}`);
    
    try {
      const contractWithSigner = this.contract.connect(this.owner);
      
      const tx = await contractWithSigner.settleDuel(duelId, winner, loser, {
        gasLimit: 150000 // Efficient gas usage
      });
      
      console.log(`📋 Settlement transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Settlement confirmed in block: ${receipt.blockNumber}`);
      
      return receipt;
    } catch (error) {
      console.error(`❌ Settlement failed for duel ${duelId}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle successful duel settlement
   * Direct Commit Benefit: Immediate reward distribution
   */
  async handleDuelSettled(duelId, winner, loser, winnerShare, platformShare, loserShare, event) {
    console.log(`🎉 Duel ${duelId} settled successfully!`);
    console.log(`   Winner (${winner}): ${ethers.formatEther(winnerShare)} CORE (85%)`);
    console.log(`   Platform: ${ethers.formatEther(platformShare)} CORE (10%)`);
    console.log(`   Loser (${loser}): ${ethers.formatEther(loserShare)} CORE (5%)`);
    
    const duel = this.activeDuels.get(Number(duelId));
    if (duel) {
      duel.status = "completed";
      duel.completedAt = Date.now();
      duel.result = { winner, loser, winnerShare, platformShare, loserShare };
      
      // Clean up timeouts
      const timeout = this.duelTimeouts.get(Number(duelId));
      if (timeout) {
        clearTimeout(timeout);
        this.duelTimeouts.delete(Number(duelId));
      }
      
      this.emit("duelCompleted", duel);
      
      // Archive completed duel after some time
      setTimeout(() => {
        this.activeDuels.delete(Number(duelId));
      }, 3600000); // Keep for 1 hour
    }
  }

  /**
   * Handle staking timeout
   * Direct Commit Approach: Simple refund for incomplete duels
   */
  async handleStakingTimeout(duelId) {
    const duel = this.activeDuels.get(duelId);
    if (!duel || duel.status !== "waiting_for_stakes") {
      return;
    }
    
    console.log(`⏰ Staking timeout for duel ${duelId}`);
    
    // Check who staked and refund them
    const stakingUsers = [];
    if (duel.stakes[duel.user1] > 0) stakingUsers.push(duel.user1);
    if (duel.stakes[duel.user2] > 0) stakingUsers.push(duel.user2);
    
    if (stakingUsers.length > 0) {
      console.log(`💸 Refunding ${stakingUsers.length} users for incomplete duel`);
      
      for (const user of stakingUsers) {
        await this.refundUser(duelId, user);
      }
    }
    
    duel.status = "cancelled_timeout";
    this.emit("duelCancelled", duel);
  }

  /**
   * Handle fitness timeout
   * Direct Commit Approach: Refund when no fitness data submitted
   */
  async handleFitnessTimeout(duelId) {
    const duel = this.activeDuels.get(duelId);
    if (!duel || duel.status !== "fitness_active") {
      return;
    }
    
    console.log(`⏰ Fitness timeout for duel ${duelId}`);
    
    // Refund both users
    await this.refundUser(duelId, duel.user1);
    await this.refundUser(duelId, duel.user2);
    
    duel.status = "cancelled_timeout";
    this.emit("duelCancelled", duel);
  }

  /**
   * Refund a user's stake
   * Direct Commit Approach: Emergency refund function
   */
  async refundUser(duelId, user) {
    console.log(`💸 Refunding user ${user} for duel ${duelId}`);
    
    try {
      const contractWithSigner = this.contract.connect(this.owner);
      
      const tx = await contractWithSigner.refundStake(duelId, user, {
        gasLimit: 100000
      });
      
      const receipt = await tx.wait();
      console.log(`✅ Refund completed: ${tx.hash}`);
      
      return receipt;
    } catch (error) {
      console.error(`❌ Refund failed for ${user}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle refund events
   */
  async handleStakeRefunded(duelId, user, amount, event) {
    console.log(`💸 Stake refunded: Duel ${duelId}, User ${user}, Amount ${ethers.formatEther(amount)} CORE`);
    this.emit("stakeRefunded", { duelId, user, amount });
  }

  /**
   * Determine winner based on fitness data
   */
  determineWinner(user1Data, user2Data) {
    // Example winner determination logic
    // In production, this would use real fitness metrics
    const score1 = user1Data.steps + (user1Data.distance * 10) + (user1Data.activeMinutes * 5);
    const score2 = user2Data.steps + (user2Data.distance * 10) + (user2Data.activeMinutes * 5);
    
    return score1 >= score2 ? user1Data.address : user2Data.address;
  }

  /**
   * Generate unique duel ID
   */
  generateDuelId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Get contract balance and platform fees
   */
  async getContractStats() {
    const contractBalance = await this.provider.getBalance(this.network.contractAddress);
    const platformBalance = await this.provider.getBalance(await this.contract.platformAddress());
    
    return {
      contractBalance: ethers.formatEther(contractBalance),
      platformBalance: ethers.formatEther(platformBalance),
      activeDuels: this.activeDuels.size
    };
  }

  /**
   * Emergency stop - refund all active duels
   */
  async emergencyStop() {
    console.log("🚨 Emergency stop initiated");
    
    for (const [duelId, duel] of this.activeDuels) {
      if (duel.status === "waiting_for_stakes" || duel.status === "fitness_active") {
        console.log(`🛑 Emergency refund for duel ${duelId}`);
        
        if (duel.stakes[duel.user1] > 0) {
          await this.refundUser(duelId, duel.user1);
        }
        if (duel.stakes[duel.user2] > 0) {
          await this.refundUser(duelId, duel.user2);
        }
        
        duel.status = "emergency_stopped";
      }
    }
    
    console.log("✅ Emergency stop completed");
  }
}

// Example usage
async function main() {
  // Initialize backend service
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const backend = new FitFiBackendService("core_testnet_2", ownerPrivateKey);
  
  await backend.initialize();
  
  // Example: Create a duel
  const duel = await backend.createDuel(
    "0x1234567890123456789012345678901234567890",
    "0x0987654321098765432109876543210987654321",
    ethers.parseEther("0.01") // 0.01 CORE stake each
  );
  
  console.log("🎮 Duel created:", duel.id);
  
  // Listen for events
  backend.on("stakeReceived", (data) => {
    console.log("🔔 Stake received notification:", data);
  });
  
  backend.on("duelCompleted", (duel) => {
    console.log("🏆 Duel completed:", duel.result);
  });
  
  // Example: Submit fitness results after both users stake
  setTimeout(async () => {
    try {
      const result = await backend.submitFitnessResults(duel.id, {
        address: duel.user1,
        steps: 10000,
        distance: 5.2,
        activeMinutes: 45
      }, {
        address: duel.user2,
        steps: 8500,
        distance: 4.8,
        activeMinutes: 40
      });
      
      console.log("📊 Fitness results submitted:", result);
    } catch (error) {
      console.error("Error submitting results:", error.message);
    }
  }, 10000); // Submit results after 10 seconds
}

// Export for use in other modules
export { FitFiBackendService };

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
