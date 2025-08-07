import { ethers } from 'ethers';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import 'react-native-url-polyfill/auto';

export interface WalletConnection {
  address: string;
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
  signer: ethers.JsonRpcSigner | ethers.Wallet;
}

export interface NonceResponse {
  success: boolean;
  data: {
    nonce: number;
    user?: any;
  };
  message: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    walletAddress: string;
    nonce: number;
  };
  message: string;
}

class WalletService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null =
    null;
  private signer: ethers.JsonRpcSigner | ethers.Wallet | null = null;
  private currentAddress: string | null = null;

  /**
   * Check if a wallet (like MetaMask) is available
   */
  async isWalletAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && !!(window as any).ethereum;
    }

    // For mobile, check if MetaMask app is installed via deep linking
    try {
      const metamaskSchemes = ['metamask://', 'https://metamask.app.link/'];

      for (const scheme of metamaskSchemes) {
        const canOpen = await Linking.canOpenURL(scheme);
        if (canOpen) {
          console.log('✅ MetaMask mobile app detected via:', scheme);
          return true;
        }
      }

      console.log('❌ MetaMask mobile app not detected');
      return false;
    } catch (error) {
      console.error('Error checking wallet availability:', error);
      return false;
    }
  }

  /**
   * Connect to the user's wallet
   */
  async connectWallet(): Promise<WalletConnection> {
    try {
      if (Platform.OS === 'web') {
        return await this.connectWebWallet();
      } else {
        return await this.connectMobileWallet();
      }
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Connect wallet on web platform
   */
  private async connectWebWallet(): Promise<WalletConnection> {
    if (!this.isWalletAvailable()) {
      throw new Error(
        'No crypto wallet found. Please install MetaMask or another Web3 wallet.'
      );
    }

    const ethereum = (window as any).ethereum;

    // Request account access
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    // Create provider and signer
    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.currentAddress = accounts[0];

    console.log('✅ Web wallet connected:', this.currentAddress);

    return {
      address: this.currentAddress,
      provider: this.provider,
      signer: this.signer,
    };
  }

  /**
   * Connect wallet on mobile platform
   */
  private async connectMobileWallet(): Promise<WalletConnection> {
    try {
      // Check if MetaMask is installed
      const isInstalled = await this.isWalletAvailable();

      if (!isInstalled) {
        const storeUrl =
          Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/metamask/id1438144202'
            : 'https://play.google.com/store/apps/details?id=io.metamask';

        throw new Error(
          `MetaMask mobile app is not installed. Please install it from: ${storeUrl}`
        );
      }

      // For mobile MetaMask connection, we need to use WalletConnect protocol
      // Since WalletConnect is complex to implement, we'll provide a practical solution

      console.log('🔗 Opening MetaMask mobile app...');

      // Try to open MetaMask with a universal link
      const dappUrl = encodeURIComponent('fitfi://connect');
      const metamaskUniversalLink = `https://metamask.app.link/dapp/${dappUrl}`;

      // Open MetaMask
      const supported = await Linking.canOpenURL(metamaskUniversalLink);
      if (supported) {
        await Linking.openURL(metamaskUniversalLink);

        // Since we can't directly get the wallet response without WalletConnect,
        // we'll provide instructions for the user
        throw new Error(
          'MetaMask has been opened. Please approve the connection in MetaMask and return to the app. For now, use email login as an alternative, or we can implement a manual wallet address entry.'
        );
      } else {
        // Try direct scheme
        const directScheme = 'metamask://';
        const canOpenDirect = await Linking.canOpenURL(directScheme);
        if (canOpenDirect) {
          await Linking.openURL(directScheme);
          throw new Error(
            'MetaMask has been opened. For full integration, this app needs WalletConnect implementation. Please use email login for now.'
          );
        }
      }

      throw new Error(
        'Unable to connect to MetaMask mobile. Please use email login or contact support.'
      );
    } catch (error) {
      console.error('❌ Mobile wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Get the current connected wallet address
   */
  getCurrentAddress(): string | null {
    return this.currentAddress;
  }

  /**
   * Sign a message with the connected wallet
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error(
          'Wallet not connected. Please connect your wallet first.'
        );
      }

      console.log('📝 Signing message:', message);

      if (Platform.OS === 'web') {
        // For web, use the normal signing method
        const signature = await this.signer.signMessage(message);
        console.log('✅ Message signed successfully');
        return signature;
      } else {
        // For mobile, since WalletConnect is not implemented yet,
        // we'll throw an informative error
        throw new Error(
          'Message signing on mobile requires WalletConnect integration. Please use the demo login option or connect via web browser.'
        );
      }
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        throw new Error(
          'Network switching on mobile requires WalletConnect integration.'
        );
      }

      if (!this.isWalletAvailable()) {
        throw new Error('No wallet available');
      }

      const ethereum = (window as any).ethereum;
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });

      console.log('✅ Network switched to:', chainId);
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      throw error;
    }
  }

  /**
   * Get the current network information
   */
  async getNetworkInfo(): Promise<{ chainId: string; name: string }> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      if (Platform.OS !== 'web') {
        // For mobile, return default network info
        return {
          chainId: '0x1',
          name: 'mainnet',
        };
      }

      const network = await this.provider.getNetwork();
      return {
        chainId: `0x${network.chainId.toString(16)}`,
        name: network.name,
      };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.currentAddress = null;
    console.log('🔌 Wallet disconnected');
  }

  /**
   * Check if wallet is currently connected
   */
  isConnected(): boolean {
    return !!(this.provider && this.signer && this.currentAddress);
  }

  /**
   * Get wallet balance in ETH
   */
  async getBalance(): Promise<string> {
    try {
      if (!this.provider || !this.currentAddress) {
        throw new Error('Wallet not connected');
      }

      const balance = await this.provider.getBalance(this.currentAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Listen for account changes
   */
  onAccountChange(callback: (accounts: string[]) => void): void {
    if (Platform.OS !== 'web' || !this.isWalletAvailable()) return;

    const ethereum = (window as any).ethereum;
    ethereum.on('accountsChanged', callback);
  }

  /**
   * Listen for network changes
   */
  onNetworkChange(callback: (chainId: string) => void): void {
    if (Platform.OS !== 'web' || !this.isWalletAvailable()) return;

    const ethereum = (window as any).ethereum;
    ethereum.on('chainChanged', callback);
  }

  /**
   * Remove event listeners
   */
  removeListeners(): void {
    if (Platform.OS !== 'web' || !this.isWalletAvailable()) return;

    const ethereum = (window as any).ethereum;
    ethereum.removeAllListeners('accountsChanged');
    ethereum.removeAllListeners('chainChanged');
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;
