import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, getApiUrl, envLog } from './EnvironmentConfig';

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

const generateMockSignature = (message: string, address: string): string => {
  return `mock_signature_${address}_${message.length}_${Date.now()}`;
};

const openMetaMask = async (message: string): Promise<string | null> => {
  try {
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
    this.baseUrl = ENV_CONFIG.apiBaseUrl;
    envLog('info', 'WalletService initialized', { baseUrl: this.baseUrl });
  }

  private generateSignMessage(address: string): string {
    const timestamp = new Date().toISOString();
    return `Welcome to FitFi!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  async connectWallet(): Promise<AuthResponse> {
    try {
      const walletAddress = await this.getMockWalletAddress();

      if (!walletAddress) {
        return {
          success: false,
          message: 'No wallet address provided',
          details: {
            title: 'Wallet Connection Failed',
            description:
              'Unable to get wallet address. Please ensure MetaMask is installed and unlocked.',
          },
        };
      }

      const message = this.generateSignMessage(walletAddress);

      const signature = await openMetaMask(message);

      if (!signature) {
        return {
          success: false,
          message: 'User rejected the signature request',
          details: {
            title: 'Signature Rejected',
            description:
              'You need to sign the message to authenticate with your wallet.',
          },
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV_CONFIG.apiTimeout
      );

      const response = await fetch(getApiUrl('/auth/wallet-auth'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
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
      envLog('error', 'Wallet connection error', error);
      return {
        success: false,
        message: 'Connection failed',
        details: {
          title: 'Network Error',
          description:
            'Unable to connect to the server. Please check your internet connection and try again.',
        },
      };
    }
  }

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
            onPress: () => resolve(ENV_CONFIG.mockWalletAddress),
          },
        ]
      );
    });
  }

  private async storeAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.WALLET_ADDRESS,
        user.walletAddress
      );
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      envLog('error', 'Error storing auth data', error);
    }
  }

  async getStoredAuthData(): Promise<{
    user: User | null;
    token: string | null;
    walletAddress: string | null;
  }> {
    try {
      const walletAddress = await AsyncStorage.getItem(
        STORAGE_KEYS.WALLET_ADDRESS
      );
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      const user = userData ? JSON.parse(userData) : null;

      return { user, token, walletAddress };
    } catch (error) {
      envLog('error', 'Error getting stored auth data', error);
      return { user: null, token: null, walletAddress: null };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const { token } = await this.getStoredAuthData();
    return !!token;
  }

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

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV_CONFIG.apiTimeout
      );

      const response = await fetch(getApiUrl('/auth/profile'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(data.data.user)
        );
      }

      return data;
    } catch (error) {
      envLog('error', 'Error getting user profile', error);
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

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV_CONFIG.apiTimeout
      );

      const response = await fetch(getApiUrl('/auth/profile'), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(data.data.user)
        );
      }

      return data;
    } catch (error) {
      envLog('error', 'Error updating profile', error);
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

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WALLET_ADDRESS,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      envLog('error', 'Error during logout', error);
    }
  }
}

export default new WalletService();
