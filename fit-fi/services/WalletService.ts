import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  walletAddress: string;
  name: string;
  role: string;
  isNewUser?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  details?: {
    title: string;
    description: string;
  };
}

const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// For development, we'll use a simple mock signature
const generateMockSignature = (message: string, address: string): string => {
  return `mock_signature_${address}_${message.length}_${Date.now()}`;
};

// MetaMask deep linking
const openMetaMask = async (message: string): Promise<string | null> => {
  try {
    // For mobile, we'll simulate MetaMask signing
    // In a real implementation, this would use deep linking or WalletConnect
    const mockSignature = generateMockSignature(message, 'mock_address');
    
    return new Promise((resolve) => {
      Alert.alert(
        'MetaMask Signature',
        `Sign this message to authenticate:\n\n"${message}"\n\nIn a real app, this would open MetaMask mobile app.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: 'Sign (Mock)',
            onPress: () => resolve(mockSignature),
          },
        ]
      );
    });
  } catch (error) {
    console.error('Error opening MetaMask:', error);
    return null;
  }
};

class WalletService {
  private baseUrl: string;

  constructor() {
    // You can change this to your backend URL
    this.baseUrl = 'http://localhost:3000/api/v1'; // Update with your backend URL
  }

  // Generate a sign-in message
  private generateSignMessage(address: string): string {
    const timestamp = new Date().toISOString();
    return `Welcome to FitFi!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  // Connect wallet and authenticate
  async connectWallet(): Promise<AuthResponse> {
    try {
      // For demo purposes, we'll use a mock wallet address
      // In a real app, this would come from MetaMask or another wallet
      const walletAddress = await this.getMockWalletAddress();
      
      if (!walletAddress) {
        return {
          success: false,
          message: 'No wallet address provided',
          details: {
            title: 'Wallet Connection Failed',
            description: 'Unable to get wallet address. Please ensure MetaMask is installed and unlocked.',
          },
        };
      }

      // Generate message to sign
      const message = this.generateSignMessage(walletAddress);

      // Get signature from MetaMask (mock for now)
      const signature = await openMetaMask(message);

      if (!signature) {
        return {
          success: false,
          message: 'User rejected the signature request',
          details: {
            title: 'Signature Rejected',
            description: 'You need to sign the message to authenticate with your wallet.',
          },
        };
      }

      // Authenticate with backend
      const response = await fetch(`${this.baseUrl}/auth/wallet-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication data
        await this.storeAuthData(data.data.user, data.data.token);
        
        return {
          success: true,
          message: data.message,
          data: data.data,
          details: data.details,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Authentication failed',
          details: data.details,
        };
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      return {
        success: false,
        message: 'Connection failed',
        details: {
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
        },
      };
    }
  }

  // Mock wallet address for demo
  private async getMockWalletAddress(): Promise<string> {
    return new Promise((resolve) => {
      Alert.alert(
        'Connect Wallet',
        'In a real app, this would connect to MetaMask or another wallet provider.\n\nFor demo purposes, enter a mock wallet address:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(''),
          },
          {
            text: 'Use Demo Address',
            onPress: () => resolve('0x742d35cc6cbf4532d44e98bbbb5b3d4b80c6efa9'),
          },
        ]
      );
    });
  }

  // Store authentication data
  private async storeAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, user.walletAddress);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Get stored authentication data
  async getStoredAuthData(): Promise<{ user: User | null; token: string | null; walletAddress: string | null }> {
    try {
      const walletAddress = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      const user = userData ? JSON.parse(userData) : null;
      
      return { user, token, walletAddress };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return { user: null, token: null, walletAddress: null };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { token } = await this.getStoredAuthData();
    return !!token;
  }

  // Get user profile from backend
  async getUserProfile(): Promise<AuthResponse> {
    try {
      const { token } = await this.getStoredAuthData();
      
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
          details: {
            title: 'Authentication Required',
            description: 'Please connect your wallet first.',
          },
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        message: 'Failed to get profile',
        details: {
          title: 'Network Error',
          description: 'Unable to fetch your profile. Please try again.',
        },
      };
    }
  }

  // Update user profile (name)
  async updateProfile(name: string): Promise<AuthResponse> {
    try {
      const { token } = await this.getStoredAuthData();
      
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
          details: {
            title: 'Authentication Required',
            description: 'Please connect your wallet first.',
          },
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        details: {
          title: 'Network Error',
          description: 'Unable to update your profile. Please try again.',
        },
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WALLET_ADDRESS,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

export default new WalletService();
