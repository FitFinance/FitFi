import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';
import { apiService } from '../utils/ApiService';
import { ImprovedWalletService } from '../utils/ImprovedWalletService';
import { ENV } from '../utils/config';

export default function SimpleLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState(false);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleWalletSignup = async () => {
    if (authInProgress) {
      console.log('⏳ Ignoring duplicate tap while auth in progress');
      return;
    }
    try {
      setAuthInProgress(true);
      setLastError(null);
      setLoading(true);
      setConnectionStatus('Connecting to wallet...');

      console.log('🔗 Starting wallet authentication...');

      // Step 1: Connect wallet and get signature
      const { address, signature, message } =
        await ImprovedWalletService.connectWalletAndAuthenticate();

      setConnectionStatus('Authenticating with server...');
      console.log('✅ Wallet connected, address:', address);

      // Step 2: Authenticate with backend
      const authResponse = await apiService.authenticateWithWallet(
        address,
        signature,
        message
      );

      if (!authResponse.success || !authResponse.data?.token) {
        throw new Error(authResponse.message || 'Authentication failed');
      }

      // Step 3: Store authentication data
      const { token, walletAddress, isNewUser } = authResponse.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('walletAddress', walletAddress);
      apiService.setAuthToken(token);

      setConnectionStatus('Success!');

      // Step 4: Show success message and navigate
      const welcomeMessage = isNewUser
        ? 'Welcome to FitFi! Your account has been created successfully.'
        : 'Welcome back! You have been logged in successfully.';

      Alert.alert('Authentication Success', welcomeMessage, [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Wallet authentication error:', error);
      setConnectionStatus('');
      setLastError(error?.message || 'Unknown error');

      let errorMessage =
        'Failed to authenticate with wallet. Please try again.';

      if (error.message?.includes('User cancelled')) {
        errorMessage = 'Wallet connection was cancelled.';
      } else if (error.message?.includes('not installed')) {
        errorMessage =
          'Wallet app is not installed. Please install a compatible wallet.';
      } else if (error.message?.includes('Signature verification failed')) {
        errorMessage =
          'Signature verification failed. Please ensure you signed the correct message.';
      }

      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
      setConnectionStatus('');
      setAuthInProgress(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!ENV.IS_DEV) {
      Alert.alert('Error', 'Demo login is only available in development mode');
      return;
    }

    try {
      setLoading(true);
      setConnectionStatus('Running demo authentication...');

      const demoWallet = '0x1234567890123456789012345678901234567890';
      const demoMessage = 'Demo login message';
      const demoSignature = 'mock-signature-for-development';

      console.log('📡 Demo: Authenticating with demo wallet:', demoWallet);

      const authResponse = await apiService.authenticateWithWallet(
        demoWallet,
        demoSignature,
        demoMessage
      );

      if (!authResponse.success || !authResponse.data?.token) {
        throw new Error(authResponse.message || 'Demo authentication failed');
      }

      const { token, walletAddress, isNewUser } = authResponse.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('walletAddress', walletAddress);
      apiService.setAuthToken(token);

      Alert.alert(
        'Demo Login Success',
        isNewUser ? 'Demo account created!' : 'Demo login successful!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Demo login error:', error);
      Alert.alert(
        'Demo Login Failed',
        error.message || 'Demo login failed. Please try again.'
      );
    } finally {
      setLoading(false);
      setConnectionStatus('');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        flexGrow: 1,
        justifyContent: 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>💎</Text>
          <Text style={styles.title}>Welcome to FitFi</Text>
          <Text style={styles.subtitle}>
            Connect your wallet to start earning rewards through fitness
            challenges
          </Text>
        </View>

        {/* Connection Status */}
        {loading && connectionStatus && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size='small' color='#667eea' />
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>
        )}

        {/* Main Auth Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleWalletSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#ffffff' />
            ) : (
              <>
                <Text style={styles.primaryButtonIcon}>🦊</Text>
                <Text style={styles.primaryButtonText}>
                  Connect Wallet & Sign Up
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.helperText}>
            By connecting your wallet, you can securely sign up or log in to
            FitFi without passwords
          </Text>

          {/* Development Demo Button */}
          {ENV.IS_DEV && (
            <TouchableOpacity
              style={[styles.demoButton, loading && styles.disabledButton]}
              onPress={handleDemoLogin}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>
                🧪 Demo Login (Dev Only)
              </Text>
            </TouchableOpacity>
          )}

          {/* Retry / Re-open wallet actions */}
          {!loading && lastError && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleWalletSignup()}
            >
              <Text style={styles.secondaryButtonText}>
                ↻ Retry Wallet Connection
              </Text>
            </TouchableOpacity>
          )}
          {!loading && !lastError && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleWalletSignup()}
            >
              <Text style={styles.secondaryButtonText}>Open Wallet Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Connect your MetaMask or compatible wallet
            </Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Sign a message to verify your wallet ownership
            </Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Start participating in fitness challenges and duels
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4338ca',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  demoButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#667eea',
    color: '#ffffff',
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#a5b4fc',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  demoButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  secondaryButtonText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#6366f1',
    color: '#ffffff',
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
});
