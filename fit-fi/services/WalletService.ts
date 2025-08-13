import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { ENV_CONFIG, getApiUrl, envLog } from './EnvironmentConfig';
// WalletConnect Universal Provider primary auth flow
import UniversalProviderLib from '@walletconnect/universal-provider'; // default export
import MetaMaskSDK from '@metamask/sdk-react-native';
// Re-introduced MetaMask direct SDK (with graceful fallback to WalletConnect).

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

export interface SessionConnectResponse {
  success: boolean;
  walletAddress?: string;
  message: string;
  pendingSignature?: boolean; // indicates next step is signing
  details?: { title: string; description: string };
}

const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

const generateMockSignature = (message: string, address: string): string =>
  `mock_signature_${address}_${message.length}_${Date.now()}`;

// WalletConnect singleton
let wcProvider: any = null;
let wcInitializing: Promise<any | null> | null = null;
let lastWcUri: string | null = null;
let metamaskSDK: MetaMaskSDK | null = null;
let metamaskInitPromise: Promise<any> | null = null;
export function reopenLastWalletConnectURI() {
  if (lastWcUri) {
    Linking.openURL(lastWcUri).catch(() =>
      envLog('warn', 'Reopen WC URI failed')
    );
  }
}
async function ensureWalletConnect(): Promise<any | null> {
  if (wcProvider) return wcProvider;
  if (wcInitializing) return wcInitializing;
  wcInitializing = (async () => {
    try {
      const projectId =
        ENV_CONFIG.walletConnectProjectId || '3a48a1389fee89b77191ca5754fc252d'; // demo fallback
      wcProvider = await UniversalProviderLib.init({
        projectId,
        metadata: {
          name: 'FitFi',
          description: 'FitFi Wallet Authentication',
          url: 'https://fitfi.app',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
          redirect: {
            native: 'fitfi://',
            universal: 'https://fitfi.app',
          },
        },
      });
      wcProvider.on?.('display_uri', (uri: string) => {
        envLog('info', 'WC URI', uri);
        lastWcUri = uri;
        const metamaskDeepLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;
        // Try MetaMask specific first, fall back to generic wc: URI
        Linking.openURL(metamaskDeepLink)
          .catch(() => Linking.openURL(uri))
          .catch(() => envLog('warn', 'Opening wallet deep link failed'));
      });
      wcProvider.on?.('session_event', (evt: any) =>
        envLog('debug', 'WC session_event', evt)
      );
      wcProvider.on?.('session_delete', () =>
        envLog('warn', 'WC session deleted')
      );
      return wcProvider;
    } catch (err) {
      envLog('warn', 'WalletConnect init failed', err);
      wcProvider = null;
      return null;
    } finally {
      wcInitializing = null;
    }
  })();
  return wcInitializing;
}

async function ensureMetaMask(): Promise<any | null> {
  if (metamaskSDK?.getProvider()) return metamaskSDK.getProvider();
  if (metamaskInitPromise) return metamaskInitPromise;
  metamaskInitPromise = (async () => {
    try {
      metamaskSDK = new MetaMaskSDK({
        dappMetadata: {
          name: 'FitFi',
          url: 'https://fitfi.app',
        },
        useDeepLink: true,
        openDeeplink: (link: string) => {
          envLog('info', 'MetaMask deeplink', link);
          return Linking.openURL(link).catch(() =>
            envLog('warn', 'Failed to open MetaMask deeplink')
          );
        },
        timer: false, // disable interval timer noise
        storage: AsyncStorage as any,
        checkInstallationImmediately: false,
      });
      const provider = metamaskSDK.getProvider();
      return provider;
    } catch (err) {
      envLog('warn', 'MetaMask SDK init failed', err);
      metamaskSDK = null;
      return null;
    } finally {
      metamaskInitPromise = null;
    }
  })();
  return metamaskInitPromise;
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

  async connectWallet(
    strategy: 'walletconnect' | 'metamask' = 'walletconnect'
  ): Promise<AuthResponse> {
    try {
      if (strategy === 'metamask') {
        // Try MetaMask direct first
        try {
          const provider: any = await ensureMetaMask();
          if (provider) {
            envLog('info', 'Attempting MetaMask direct connection');
            const accounts: string[] = await provider.request({
              method: 'eth_requestAccounts',
            });
            const walletAddress = accounts?.[0];
            if (!walletAddress) {
              return {
                success: false,
                message: 'No wallet address returned',
                details: {
                  title: 'MetaMask Address Missing',
                  description:
                    'No address received from MetaMask. Ensure an account is selected.',
                },
              };
            }
            const message = this.generateSignMessage(walletAddress);
            const hexMessage =
              '0x' + Buffer.from(message, 'utf8').toString('hex');
            let signature: string | null = null;
            try {
              signature = await provider.request({
                method: 'personal_sign',
                params: [hexMessage, walletAddress],
              });
            } catch (mmSignErr: any) {
              envLog(
                'warn',
                'MetaMask personal_sign failed, fallback raw',
                mmSignErr
              );
              try {
                signature = await provider.request({
                  method: 'personal_sign',
                  params: [message, walletAddress],
                });
              } catch (mmSignErr2: any) {
                envLog(
                  'warn',
                  'MetaMask second sign attempt failed',
                  mmSignErr2
                );
                if (ENV_CONFIG.appEnv === 'development') {
                  signature = generateMockSignature(message, walletAddress);
                } else {
                  return {
                    success: false,
                    message: 'Signature rejected',
                    details: {
                      title: 'Signature Rejected',
                      description:
                        mmSignErr2?.message ||
                        'You must sign the message to continue.',
                    },
                  };
                }
              }
            }
            if (!signature) {
              return {
                success: false,
                message: 'No signature captured',
                details: {
                  title: 'Signing Failed',
                  description:
                    'A signature is required. Please try again in MetaMask.',
                },
              };
            }
            return this.authenticateWithSignature(
              walletAddress,
              signature,
              message
            );
          }
        } catch (mmErr) {
          envLog('warn', 'MetaMask direct flow failed, will fallback', mmErr);
        }
        // If we reach here fallback to WalletConnect (MetaMask via WC)
        envLog('info', 'Falling back to WalletConnect for MetaMask strategy');
      }

      // WalletConnect path (default)
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
      const connectTimeoutMs = 30000;
      const connectPromise = provider.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'personal_sign',
              'eth_sign',
              'eth_sendTransaction',
              'eth_signTypedData',
              'eth_signTypedData_v4',
            ],
            chains: ['eip155:1'],
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });
      let session;
      try {
        session = await Promise.race([
          connectPromise,
          new Promise((_, rej) =>
            setTimeout(
              () => rej(new Error('Connection timeout')),
              connectTimeoutMs
            )
          ),
        ]);
      } catch (err: any) {
        return {
          success: false,
          message: 'Wallet connection failed',
          details: {
            title: 'Connection Failed',
            description:
              err?.message === 'Connection timeout'
                ? 'Wallet did not respond in time. Re-open your wallet and try again.'
                : err?.message || 'You cancelled or an error occurred.',
          },
        };
      }
      envLog('info', 'WC session established', session?.topic);
      let accounts =
        session?.namespaces?.eip155?.accounts || session?.accounts || [];
      if ((!accounts || accounts.length === 0) && provider.request) {
        try {
          // Fallback request for accounts (some wallets require)
          const fallbackAccounts = await provider.request({
            method: 'eth_accounts',
          });
          if (Array.isArray(fallbackAccounts) && fallbackAccounts.length) {
            accounts = fallbackAccounts.map((a: string) => `eip155:1:${a}`);
          }
        } catch (acctErr) {
          envLog('warn', 'Fallback eth_accounts failed', acctErr);
        }
      }
      walletAddress = accounts[0]?.split(':').pop();
      if (!walletAddress) {
        return {
          success: false,
          message: 'No wallet address returned',
          details: {
            title: 'Wallet Address Missing',
            description:
              'No address received from wallet. Ensure the account is selected.',
          },
        };
      }
      const message = this.generateSignMessage(walletAddress);
      // Hex encode per personal_sign expectations
      const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');
      try {
        // personal_sign expects [data, address]
        signature = await provider.request({
          method: 'personal_sign',
          params: [hexMessage, walletAddress],
        });
      } catch (signErr1: any) {
        envLog('warn', 'personal_sign failed, retrying alternatives', signErr1);
        try {
          // Some wallets accept plain string
          signature = await provider.request({
            method: 'personal_sign',
            params: [message, walletAddress],
          });
        } catch {
          // ignored fallback attempt
          try {
            // Try eth_sign (params: address, data)
            signature = await provider.request({
              method: 'eth_sign',
              params: [walletAddress, hexMessage],
            });
          } catch (signErr3: any) {
            if (ENV_CONFIG.appEnv === 'development') {
              envLog(
                'warn',
                'All signing methods failed, using mock (dev only)',
                signErr3
              );
              signature = generateMockSignature(message, walletAddress);
            } else {
              return {
                success: false,
                message: 'Signature rejected',
                details: {
                  title: 'Signature Rejected',
                  description:
                    signErr3?.message ||
                    'You must sign the message to continue.',
                },
              };
            }
          }
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

  // --- Two-step flow helpers ---
  async connectSession(): Promise<SessionConnectResponse> {
    try {
      // Prefer existing MetaMask direct session if available
      if (metamaskSDK?.getProvider()) {
        try {
          const provider: any = metamaskSDK.getProvider();
          const accounts: string[] = await provider.request({
            method: 'eth_accounts',
          });
          const walletAddress = accounts?.[0];
          if (walletAddress) {
            return {
              success: true,
              walletAddress,
              message: 'Session active (MetaMask)',
              pendingSignature: true,
            };
          }
        } catch {}
      }
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

      // If already have an active session, reuse
      const existing =
        provider.session || provider.sessionStore?.getAll?.()?.[0];
      if (existing) {
        const accounts = existing.namespaces?.eip155?.accounts || [];
        const walletAddress = accounts[0]?.split(':').pop();
        if (walletAddress) {
          return {
            success: true,
            walletAddress,
            message: 'Session active',
            pendingSignature: true,
          };
        }
      }

      const connectTimeoutMs = 30000;
      const connectPromise = provider.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'personal_sign',
              'eth_sign',
              'eth_sendTransaction',
              'eth_signTypedData',
              'eth_signTypedData_v4',
            ],
            chains: ['eip155:1'],
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });
      const session = await Promise.race([
        connectPromise,
        new Promise((_, rej) =>
          setTimeout(
            () => rej(new Error('Connection timeout')),
            connectTimeoutMs
          )
        ),
      ]);
      let accounts = session?.namespaces?.eip155?.accounts || [];
      const walletAddress = accounts[0]?.split(':').pop();
      if (!walletAddress) {
        return {
          success: false,
          message: 'No wallet address returned',
          details: {
            title: 'Wallet Address Missing',
            description:
              'No address received from wallet. Ensure the account is selected.',
          },
        };
      }
      return {
        success: true,
        walletAddress,
        message: 'Connected',
        pendingSignature: true,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Wallet connection failed',
        details: {
          title: 'Connection Failed',
          description:
            err?.message === 'Connection timeout'
              ? 'Wallet did not respond in time. Re-open your wallet and try again.'
              : err?.message || 'You cancelled or an error occurred.',
        },
      };
    }
  }

  async signAndAuthenticate(explicitAddress?: string): Promise<AuthResponse> {
    try {
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
        } as AuthResponse;
      }
      const activeSession =
        provider.session || provider.sessionStore?.getAll?.()?.[0];
      let accounts = activeSession?.namespaces?.eip155?.accounts || [];
      if ((!accounts || accounts.length === 0) && provider.request) {
        try {
          const fallback = await provider.request({ method: 'eth_accounts' });
          if (Array.isArray(fallback) && fallback.length) {
            accounts = fallback.map((a: string) => `eip155:1:${a}`);
          }
        } catch (e) {
          envLog('warn', 'Fallback eth_accounts failed (sign step)', e);
        }
      }
      let walletAddress = explicitAddress || accounts[0]?.split(':').pop();
      if (!walletAddress) {
        return {
          success: false,
          message: 'No active wallet address',
          details: {
            title: 'No Address',
            description: 'Connect a wallet session before signing.',
          },
        };
      }
      const message = this.generateSignMessage(walletAddress);
      const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');
      let signature: string | null = null;
      try {
        signature = await provider.request({
          method: 'personal_sign',
          params: [hexMessage, walletAddress],
        });
      } catch (e1: any) {
        envLog('warn', 'personal_sign failed (two-step)', e1);
        try {
          signature = await provider.request({
            method: 'personal_sign',
            params: [message, walletAddress],
          });
        } catch (e2: any) {
          envLog('warn', 'Retry personal_sign(raw) failed (two-step)', e2);
          try {
            signature = await provider.request({
              method: 'eth_sign',
              params: [walletAddress, hexMessage],
            });
          } catch (e3: any) {
            if (ENV_CONFIG.appEnv === 'development') {
              envLog(
                'warn',
                'All sign methods failed using mock (two-step)',
                e3
              );
              signature = generateMockSignature(message, walletAddress);
            } else {
              return {
                success: false,
                message: 'Signature rejected',
                details: {
                  title: 'Signature Rejected',
                  description:
                    e3?.message || 'You must sign the message to continue.',
                },
              };
            }
          }
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
    } catch (err) {
      envLog('error', 'signAndAuthenticate error', err);
      return {
        success: false,
        message: 'Sign failed',
        details: {
          title: 'Signing Error',
          description: 'Unexpected error during signing.',
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
