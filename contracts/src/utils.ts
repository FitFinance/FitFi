import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, NETWORKS, NetworkName } from "./constants";
import { DuelStaking } from "../typechain-types";

// Import the contract ABI
import DuelStakingABI from "../deployments/DuelStaking-ABI.json";

/**
 * Creates a contract instance for the DuelStaking contract
 * @param network - The network to connect to
 * @param signerOrProvider - Ethers signer or provider
 * @returns Contract instance
 */
export function createDuelStakingContract(
  network: NetworkName,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  const contractAddress = CONTRACT_ADDRESSES[network].DuelStaking;
  
  if (!contractAddress) {
    throw new Error(`DuelStaking contract not deployed on ${network}`);
  }

  return new ethers.Contract(contractAddress, DuelStakingABI, signerOrProvider);
}

/**
 * Creates a provider for the specified network
 * @param network - The network to connect to
 * @param apiKey - Optional API key for the provider
 * @returns Ethers provider
 */
export function createProvider(network: NetworkName, apiKey?: string) {
  const networkConfig = NETWORKS[network];
  
  if (network === "localhost") {
    return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  }
  
  // For other networks, you might want to use different provider types
  return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
}

/**
 * Creates a wallet/signer for the specified network
 * @param privateKey - Private key (with or without 0x prefix)
 * @param network - The network to connect to
 * @returns Ethers wallet
 */
export function createWallet(privateKey: string, network: NetworkName) {
  const provider = createProvider(network);
  
  // Ensure private key has 0x prefix
  const formattedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  
  return new ethers.Wallet(formattedPrivateKey, provider);
}

/**
 * Utility functions for common contract operations
 */
export class DuelStakingUtils {
  private contract: ethers.Contract;
  
  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  /**
   * Stakes tokens for a duel
   * @param duelId - The duel ID
   * @param amount - Amount to stake in ETH
   * @param signer - Signer to use for the transaction
   */
  async stakeForDuel(duelId: number, amount: string, signer: ethers.Signer) {
    const contractWithSigner = this.contract.connect(signer);
    const stakeAmount = ethers.parseEther(amount);
    
    return await (contractWithSigner as any).stakeForDuel(duelId, { value: stakeAmount });
  }

  /**
   * Settles a duel (owner only)
   * @param duelId - The duel ID
   * @param winner - Winner's address
   * @param loser - Loser's address
   * @param ownerSigner - Owner's signer
   */
  async settleDuel(duelId: number, winner: string, loser: string, ownerSigner: ethers.Signer) {
    const contractWithSigner = this.contract.connect(ownerSigner);
    
    return await (contractWithSigner as any).settleDuel(duelId, winner, loser);
  }

  /**
   * Refunds a stake (owner only)
   * @param duelId - The duel ID
   * @param user - User's address to refund
   * @param ownerSigner - Owner's signer
   */
  async refundStake(duelId: number, user: string, ownerSigner: ethers.Signer) {
    const contractWithSigner = this.contract.connect(ownerSigner);
    
    return await (contractWithSigner as any).refundStake(duelId, user);
  }

  /**
   * Gets a user's stake for a specific duel
   * @param duelId - The duel ID
   * @param user - User's address
   * @returns Stake amount in wei
   */
  async getStake(duelId: number, user: string): Promise<bigint> {
    return await (this.contract as any).getStake(duelId, user);
  }

  /**
   * Gets total stakes for a duel between two users
   * @param duelId - The duel ID
   * @param user1 - First user's address
   * @param user2 - Second user's address
   * @returns Total stake amount in wei
   */
  async getTotalDuelStakes(duelId: number, user1: string, user2: string): Promise<bigint> {
    return await (this.contract as any).getTotalDuelStakes(duelId, user1, user2);
  }

  /**
   * Gets the contract owner
   * @returns Owner's address
   */
  async getOwner(): Promise<string> {
    return await (this.contract as any).owner();
  }

  /**
   * Gets the platform address
   * @returns Platform address
   */
  async getPlatformAddress(): Promise<string> {
    return await (this.contract as any).platformAddress();
  }

  /**
   * Sets up event listeners for contract events
   * @param callbacks - Object with callback functions for each event
   */
  setupEventListeners(callbacks: {
    onStakePlaced?: (duelId: bigint, user: string, amount: bigint) => void;
    onDuelSettled?: (duelId: bigint, winner: string, loser: string, winnerShare: bigint, platformShare: bigint, loserShare: bigint) => void;
    onStakeRefunded?: (duelId: bigint, user: string, amount: bigint) => void;
  }) {
    if (callbacks.onStakePlaced) {
      (this.contract as any).on("StakePlaced", callbacks.onStakePlaced);
    }
    
    if (callbacks.onDuelSettled) {
      (this.contract as any).on("DuelSettled", callbacks.onDuelSettled);
    }
    
    if (callbacks.onStakeRefunded) {
      (this.contract as any).on("StakeRefunded", callbacks.onStakeRefunded);
    }
  }

  /**
   * Removes all event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

/**
 * Helper function to format wei to ETH string
 * @param weiAmount - Amount in wei
 * @returns Formatted ETH string
 */
export function formatEther(weiAmount: bigint): string {
  return ethers.formatEther(weiAmount);
}

/**
 * Helper function to parse ETH string to wei
 * @param etherAmount - Amount in ETH
 * @returns Amount in wei
 */
export function parseEther(etherAmount: string): bigint {
  return ethers.parseEther(etherAmount);
}
