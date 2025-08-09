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

const generateMockSignature = (message: string, address: string): string =>
  `mock_signature_${address}_${message.length}_${Date.now()}`;

// WalletConnect Universal Provider (preferred programmatic flow)
// We previously attempted to use @walletconnect/modal-react-native `create` API (which does not exist).
// Switch to dynamic import of UniversalProvider to avoid bundling issues if unused.
let wcProvider: any = null;
let wcInitializing: Promise<any> | null = null;
async function ensureWalletConnect(): Promise<any | null> {
  if (wcProvider) return wcProvider;
  if (wcInitializing) return wcInitializing;
  wcInitializing = (async () => {
    try {
      const { default: UniversalProvider } = await import(
        '@walletconnect/universal-provider'
      );
      const projectId =
        ENV_CONFIG.walletConnectProjectId ||
        // Safe fallback (public demo projectId) – replace in prod env variables
        '3a48a1389fee89b77191ca5754fc252d';
      wcProvider = await UniversalProvider.init({
        projectId,
        metadata: {
          name: 'FitFi',
          description: 'FitFi Wallet Authentication',
          url: 'https://fitfi.app',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      });

      // Basic event logging (optional)
      wcProvider.on?.('display_uri', (uri: string) => {
        envLog('info', 'WC display_uri', uri);
      });
      wcProvider.on?.('session_event', (evt: any) => {
        envLog('debug', 'WC session_event', evt);
      });
      wcProvider.on?.('session_delete', () => {
        envLog('warn', 'WC session deleted');
      });
      return wcProvider;
    } catch (err) {
      envLog(
        'warn',
        'WalletConnect provider init failed (fallback to mock)',
        err
      );
      wcProvider = null;
      return null;
    } finally {
      wcInitializing = null;
    }
  })();
  return wcInitializing;
}

// Removed openMetaMask mock flow (real wallet required now)

class WalletService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV_CONFIG.apiBaseUrl;
    envLog('info', 'WalletService initialized', { baseUrl: this.baseUrl });
  }

  public generateSignMessage(address: string): string {
    const timestamp = new Date().toISOString();
    return `Welcome to FitFi!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  public async authenticateWithSignature(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<AuthResponse> {
    try {
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
        body: JSON.stringify({ walletAddress, signature, message }),
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
      }
      return {
        success: false,
        message: data.message || 'Authentication failed',
        details: data.details,
      };
    } catch (err) {
      envLog('error', 'Authenticate with signature error', err);
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

  async connectWallet(): Promise<AuthResponse> {
    try {
      let signature: string | null = null;
      let walletAddress: string | undefined;
      const provider = await ensureWalletConnect();
      if (!provider) {
        return {
          success: false,
          message: 'WalletConnect unavailable',
          details: {
            title: 'WalletConnect Not Ready',
            description:
              'Unable to initialize WalletConnect. Please try again later.',
          },
        };
      }
      try {
        // Establish a session (Ethereum mainnet by default). Adjust chains if supporting testnets.
        const session = await provider.connect({
          optionalNamespaces: {
            eip155: {
              methods: [
                'personal_sign',
                'eth_sendTransaction',
                'eth_signTypedData',
              ],
              chains: ['eip155:1'],
              events: ['accountsChanged', 'chainChanged'],
            },
          },
        });
        // Accounts format: eip155:1:0xABC...
        const accounts =
          session?.namespaces?.eip155?.accounts || session?.accounts || [];
        walletAddress = accounts[0]?.split(':').pop();
      } catch (err) {
        return {
          success: false,
          message: 'Wallet connection cancelled',
          details: {
            title: 'Cancelled',
            description: 'You must approve the wallet connection to proceed.',
          },
        };
      }
      if (!walletAddress) {
        return {
          success: false,
          message: 'No wallet address returned',
          details: {
            title: 'Wallet Address Missing',
            description: 'No address received from wallet. Retry connection.',
          },
        };
      }
      const message = this.generateSignMessage(walletAddress);
      try {
        const params = [message, walletAddress];
        signature = await provider.request({
          method: 'personal_sign',
          params,
        });
      } catch (signErr) {
        if (ENV_CONFIG.appEnv === 'development') {
          envLog('warn', 'Signing failed, using mock (dev only)', signErr);
          signature = generateMockSignature(message, walletAddress);
        } else {
          return {
            success: false,
            message: 'Signature rejected',
            details: {
              title: 'Signature Rejected',
              description:
                'You must sign the message in your wallet to authenticate.',
            },
          };
        }
      }
      if (!signature) {
        return {
          success: false,
          message: 'No signature captured',
          details: {
            title: 'Signing Failed',
            description: 'A signature is required. Please try again.',
          },
        };
      }
      return this.authenticateWithSignature(walletAddress, signature, message);
    } catch (error) {
      envLog('error', 'Wallet connection error', error);
      return {
        success: false,
        message: 'Connection failed',
        details: {
          title: 'Network Error',
          description:
            'Unable to connect to the server. Check your internet connection.',
        },
      };
    }
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
