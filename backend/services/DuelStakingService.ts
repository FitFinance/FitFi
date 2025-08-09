// @ts-nocheck
import { ethers } from 'ethers';
import { config } from 'dotenv';

config();

export interface StakePlacedEvent {
  duelId: bigint;
  user: string;
  amount: bigint;
}

export interface DuelSettledEvent {
  duelId: bigint;
  winner: string;
  loser: string;
  winnerShare: bigint;
  platformShare: bigint;
  loserShare: bigint;
}

export interface StakeRefundedEvent {
  duelId: bigint;
  user: string;
  amount: bigint;
}

export class DuelStakingService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;

  // DuelStaking ABI - Direct Commit Pattern (matches the actual deployed contract)
  private readonly DUEL_STAKING_ABI: Array<string> = [
    'function stakeForDuel(uint256 duelId) external payable',
    'function settleDuel(uint256 duelId, address winner, address loser) external',
    'function refundStake(uint256 duelId, address user) external',
    'function setPlatformAddress(address _newPlatformAddress) external',
    'function getStake(uint256 duelId, address user) external view returns (uint256)',
    'function getTotalDuelStakes(uint256 duelId, address user1, address user2) external view returns (uint256)',
    'function platformAddress() external view returns (address)',
    'function owner() external view returns (address)',

    // Events
    'event StakePlaced(uint256 indexed duelId, address indexed user, uint256 amount)',
    'event DuelSettled(uint256 indexed duelId, address winner, address loser, uint256 winnerShare, uint256 platformShare, uint256 loserShare)',
    'event StakeRefunded(uint256 indexed duelId, address indexed user, uint256 amount)',
    'event PlatformAddressUpdated(address oldAddress, address newAddress)',
  ];

  constructor() {
    const rpcUrl: string | undefined = process.env.BLOCKCHAIN_RPC_URL;
    this.contractAddress = process.env.DUEL_STAKING_CONTRACT_ADDRESS!;

    if (!rpcUrl || !this.contractAddress) {
      throw new Error(
        'Missing blockchain configuration in environment variables'
      );
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.DUEL_STAKING_ABI,
      this.provider
    );
  }

  /**
   * Stake to a duel (Direct Commit Pattern)
   */
  async stakeForDuel(
    duelId: number,
    stakeAmount: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet: ethers.Wallet = new ethers.Wallet(
        privateKey,
        this.provider
      );
      const contractWithSigner = this.contract.connect(wallet) as any;

      const stakeAmountWei: bigint = ethers.parseEther(stakeAmount);

      const tx: ethers.TransactionResponse = await (
        contractWithSigner as any
      ).stakeForDuel(duelId, {
        value: stakeAmountWei,
      });

      // In ethers v6, tx.wait() may return null if the node doesn't support it; return tx.hash either way
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error staking for duel:', error);
      throw new Error(
        `Failed to stake for duel: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Settle a duel (Direct Commit Pattern)
   */
  async settleDuel(
    duelId: number,
    winnerAddress: string,
    loserAddress: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet: ethers.Wallet = new ethers.Wallet(
        privateKey,
        this.provider
      );
      const contractWithSigner = this.contract.connect(wallet) as any;

      const tx: ethers.TransactionResponse = await (
        contractWithSigner as any
      ).settleDuel(duelId, winnerAddress, loserAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error settling duel:', error);
      throw new Error(
        `Failed to settle duel: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Refund a user's stake
   */
  async refundStake(
    duelId: number,
    userAddress: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet: ethers.Wallet = new ethers.Wallet(
        privateKey,
        this.provider
      );
      const contractWithSigner = this.contract.connect(wallet) as any;

      const tx: ethers.TransactionResponse = await (
        contractWithSigner as any
      ).refundStake(duelId, userAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error refunding stake:', error);
      throw new Error(
        `Failed to refund stake: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get the stake amount for a specific user in a specific duel
   */
  async getStake(duelId: number, userAddress: string): Promise<bigint> {
    try {
      return await this.contract.getStake(duelId, userAddress);
    } catch (error) {
      console.error('Error getting stake:', error);
      throw new Error(
        `Failed to get stake: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get the total stakes for a duel between two users
   */
  async getTotalDuelStakes(
    duelId: number,
    user1Address: string,
    user2Address: string
  ): Promise<bigint> {
    try {
      return await this.contract.getTotalDuelStakes(
        duelId,
        user1Address,
        user2Address
      );
    } catch (error) {
      console.error('Error getting total duel stakes:', error);
      throw new Error(
        `Failed to get total duel stakes: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Check if both users have staked for a duel
   */
  async areBothUsersStaked(
    duelId: number,
    user1Address: string,
    user2Address: string
  ): Promise<{
    user1Staked: boolean;
    user2Staked: boolean;
    bothStaked: boolean;
  }> {
    try {
      const [user1Stake, user2Stake]: [bigint, bigint] = await Promise.all([
        this.getStake(duelId, user1Address),
        this.getStake(duelId, user2Address),
      ]);

      const user1Staked: boolean = user1Stake > 0n;
      const user2Staked: boolean = user2Stake > 0n;

      return {
        user1Staked,
        user2Staked,
        bothStaked: user1Staked && user2Staked,
      };
    } catch (error) {
      console.error('Error checking user stakes:', error);
      throw new Error(
        `Failed to check user stakes: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Listen for blockchain events
   */
  setupEventListeners(callbacks: {
    onStakePlaced?: (event: StakePlacedEvent) => void;
    onDuelSettled?: (event: DuelSettledEvent) => void;
    onStakeRefunded?: (event: StakeRefundedEvent) => void;
  }) {
    if (callbacks.onStakePlaced) {
      this.contract.on(
        'StakePlaced',
        (duelId: bigint, user: string, amount: bigint) => {
          callbacks.onStakePlaced!({
            duelId,
            user,
            amount,
          });
        }
      );
    }

    if (callbacks.onDuelSettled) {
      this.contract.on(
        'DuelSettled',
        (
          duelId: bigint,
          winner: string,
          loser: string,
          winnerShare: bigint,
          platformShare: bigint,
          loserShare: bigint
        ) => {
          callbacks.onDuelSettled!({
            duelId,
            winner,
            loser,
            winnerShare,
            platformShare,
            loserShare,
          });
        }
      );
    }

    if (callbacks.onStakeRefunded) {
      this.contract.on(
        'StakeRefunded',
        (duelId: bigint, user: string, amount: bigint) => {
          callbacks.onStakeRefunded!({
            duelId,
            user,
            amount,
          });
        }
      );
    }
  }

  /**
   * Get the contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get the provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get contract owner address
   */
  async getOwner(): Promise<string> {
    try {
      return await this.contract.owner();
    } catch (error) {
      console.error('Error getting contract owner:', error);
      throw new Error(
        `Failed to get contract owner: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get platform address
   */
  async getPlatformAddress(): Promise<string> {
    try {
      return await this.contract.platformAddress();
    } catch (error) {
      console.error('Error getting platform address:', error);
      throw new Error(
        `Failed to get platform address: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

// Singleton instance
const duelStakingService: DuelStakingService = new DuelStakingService();

export { duelStakingService };
