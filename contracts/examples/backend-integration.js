// Example of how to integrate DuelStaking contract with backend
// This file demonstrates the key patterns without TypeScript compilation issues

const { ethers } = require("ethers");
const DuelStakingABI = require("../deployments/DuelStaking-ABI.json");

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  core_testnet: "", // To be filled after testnet deployment
};

// Network configurations
const NETWORKS = {
  localhost: {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
  },
  core_testnet: {
    chainId: 1115,
    rpcUrl: "https://rpc.test.btcs.network",
  }
};

/**
 * Example: Setting up contract connection
 */
async function setupContract(network = "localhost") {
  // Create provider
  const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
  
  // Create contract instance
  const contractAddress = CONTRACT_ADDRESSES[network];
  const contract = new ethers.Contract(contractAddress, DuelStakingABI, provider);
  
  return { provider, contract };
}

/**
 * Example: Listening to contract events
 */
async function setupEventListeners(contract) {
  // Listen for StakePlaced events
  contract.on("StakePlaced", (duelId, user, amount, event) => {
    console.log("Stake placed:", {
      duelId: duelId.toString(),
      user,
      amount: ethers.formatEther(amount),
      txHash: event.transactionHash
    });
  });

  // Listen for DuelSettled events
  contract.on("DuelSettled", (duelId, winner, loser, winnerShare, platformShare, loserShare, event) => {
    console.log("Duel settled:", {
      duelId: duelId.toString(),
      winner,
      loser,
      winnerShare: ethers.formatEther(winnerShare),
      platformShare: ethers.formatEther(platformShare),
      loserShare: ethers.formatEther(loserShare),
      txHash: event.transactionHash
    });
  });

  // Listen for StakeRefunded events
  contract.on("StakeRefunded", (duelId, user, amount, event) => {
    console.log("Stake refunded:", {
      duelId: duelId.toString(),
      user,
      amount: ethers.formatEther(amount),
      txHash: event.transactionHash
    });
  });
}

/**
 * Example: Backend functions for contract interaction
 */
class DuelStakingBackend {
  constructor(network = "localhost") {
    this.network = network;
    this.provider = new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES[network], 
      DuelStakingABI, 
      this.provider
    );
  }

  // Get user's stake for a duel
  async getUserStake(duelId, userAddress) {
    try {
      const stake = await this.contract.getStake(duelId, userAddress);
      return ethers.formatEther(stake);
    } catch (error) {
      console.error("Error getting user stake:", error);
      throw error;
    }
  }

  // Get total stakes for a duel
  async getTotalDuelStakes(duelId, user1Address, user2Address) {
    try {
      const totalStakes = await this.contract.getTotalDuelStakes(duelId, user1Address, user2Address);
      return ethers.formatEther(totalStakes);
    } catch (error) {
      console.error("Error getting total stakes:", error);
      throw error;
    }
  }

  // Settle a duel (requires owner private key)
  async settleDuel(duelId, winnerAddress, loserAddress, ownerPrivateKey) {
    try {
      // Create wallet with owner's private key
      const wallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      // Send settlement transaction
      const tx = await contractWithSigner.settleDuel(duelId, winnerAddress, loserAddress);
      console.log("Settlement transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Settlement confirmed in block:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("Error settling duel:", error);
      throw error;
    }
  }

  // Refund a stake (requires owner private key)
  async refundStake(duelId, userAddress, ownerPrivateKey) {
    try {
      const wallet = new ethers.Wallet(ownerPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.refundStake(duelId, userAddress);
      console.log("Refund transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Refund confirmed in block:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("Error refunding stake:", error);
      throw error;
    }
  }

  // Get contract information
  async getContractInfo() {
    try {
      const owner = await this.contract.owner();
      const platformAddress = await this.contract.platformAddress();
      
      return {
        contractAddress: this.contract.target,
        owner,
        platformAddress,
        network: this.network
      };
    } catch (error) {
      console.error("Error getting contract info:", error);
      throw error;
    }
  }

  // Start listening to events
  startEventListening() {
    setupEventListeners(this.contract);
    console.log("Event listening started for network:", this.network);
  }

  // Stop listening to events
  stopEventListening() {
    this.contract.removeAllListeners();
    console.log("Event listening stopped");
  }
}

// Example usage
async function example() {
  try {
    // Initialize backend service
    const duelStaking = new DuelStakingBackend("localhost");
    
    // Get contract information
    const contractInfo = await duelStaking.getContractInfo();
    console.log("Contract Info:", contractInfo);
    
    // Start listening to events
    duelStaking.startEventListening();
    
    // Example: Get stake for duel ID 1 and user address
    // const userStake = await duelStaking.getUserStake(1, "0x...");
    // console.log("User stake:", userStake, "ETH");
    
  } catch (error) {
    console.error("Example error:", error);
  }
}

// Export for use in other modules
module.exports = {
  DuelStakingBackend,
  CONTRACT_ADDRESSES,
  NETWORKS,
  setupContract,
  setupEventListeners
};

// Run example if this file is executed directly
if (require.main === module) {
  example();
}
