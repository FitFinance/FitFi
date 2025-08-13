import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import WalletService, {
  User,
  AuthResponse,
  SessionConnectResponse,
} from '../services/WalletService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  connectWallet: (
    strategy?: 'walletconnect' | 'metamask'
  ) => Promise<AuthResponse>;
  connectSession: (
    strategy?: 'walletconnect' | 'metamask'
  ) => Promise<SessionConnectResponse>;
  signAndAuthenticate: (address?: string) => Promise<AuthResponse>;
  updateProfile: (name: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { user: storedUser, token } =
        await WalletService.getStoredAuthData();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);

        // Optionally refresh profile from server
        try {
          const response = await WalletService.getUserProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (
    strategy: 'walletconnect' | 'metamask' = 'walletconnect'
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await WalletService.connectWallet(strategy);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        message: 'Failed to connect wallet',
        details: {
          title: 'Connection Error',
          description:
            'An unexpected error occurred while connecting your wallet.',
        },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const connectSession = async (
    strategy: 'walletconnect' | 'metamask' = 'walletconnect'
  ): Promise<SessionConnectResponse> => {
    try {
      setIsLoading(true);
      // MetaMask strategy attempts MetaMask direct first using connectWallet with early return pattern
      if (strategy === 'metamask') {
        const res = await WalletService.connectSession();
        return res;
      }
      return WalletService.connectSession();
    } finally {
      setIsLoading(false);
    }
  };

  const signAndAuthenticate = async (
    address?: string
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const res = await WalletService.signAndAuthenticate(address);
      if (res.success && res.data) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string): Promise<AuthResponse> => {
    try {
      const response = await WalletService.updateProfile(name);

      if (response.success && response.data) {
        setUser(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        details: {
          title: 'Update Error',
          description:
            'An unexpected error occurred while updating your profile.',
        },
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await WalletService.getUserProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await WalletService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    connectWallet,
    connectSession,
    signAndAuthenticate,
    updateProfile,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
