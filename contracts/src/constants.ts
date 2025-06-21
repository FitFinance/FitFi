// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  localhost: {
    DuelStaking: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Updated after deployment
  },
  core_testnet: {
    DuelStaking: "", // To be filled after testnet deployment
  },
  core_mainnet: {
    DuelStaking: "", // To be filled after mainnet deployment
  }
} as const;

// Network configurations
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    name: "Localhost",
  },
  core_testnet: {
    chainId: 1115,
    rpcUrl: "https://rpc.test.btcs.network",
    name: "Core Testnet",
    explorer: "https://scan.test.btcs.network",
  },
  core_mainnet: {
    chainId: 1116,
    rpcUrl: "https://rpc.coredao.org",
    name: "Core Mainnet", 
    explorer: "https://scan.coredao.org",
  }
} as const;

// Contract configuration
export const CONTRACT_CONFIG = {
  // Reward distribution percentages
  WINNER_PERCENTAGE: 85,
  PLATFORM_PERCENTAGE: 10,
  LOSER_PERCENTAGE: 5,
  
  // Gas limits for different operations
  GAS_LIMITS: {
    STAKE: 100000,
    SETTLE: 200000,
    REFUND: 100000,
  },
  
  // Event topics for filtering
  EVENT_SIGNATURES: {
    STAKE_PLACED: "StakePlaced(uint256,address,uint256)",
    DUEL_SETTLED: "DuelSettled(uint256,address,address,uint256,uint256,uint256)",
    STAKE_REFUNDED: "StakeRefunded(uint256,address,uint256)",
  }
} as const;

// Type definitions for TypeScript
export type NetworkName = keyof typeof CONTRACT_ADDRESSES;
export type ContractName = keyof typeof CONTRACT_ADDRESSES.localhost;

export interface DuelSettledEvent {
  duelId: string;
  winner: string;
  loser: string;
  winnerShare: string;
  platformShare: string;
  loserShare: string;
}

export interface StakePlacedEvent {
  duelId: string;
  user: string;
  amount: string;
}

export interface StakeRefundedEvent {
  duelId: string;
  user: string;
  amount: string;
}
