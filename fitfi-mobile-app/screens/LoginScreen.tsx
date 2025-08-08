import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';
import { apiService } from '../utils/ApiService';
import { ENV } from '../utils/config';
import { NetworkDiagnostics } from '../utils/NetworkDiagnostics';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  // State management
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [nonce, setNonce] = useState<number | null>(null);
  const [step, setStep] = useState<'input' | 'processing'>('input');

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

  const validateWalletAddress = (address: string): boolean => {
    return address.length === 42 && address.startsWith('0x');
  };

  const handleConnectWallet = async () => {
    if (!validateWalletAddress(walletAddress)) {
      Alert.alert(
        'Invalid Address',
        'Please enter a valid wallet address (0x...)'
      );
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      console.log('📡 Step 1: Requesting nonce for wallet:', walletAddress);
      const nonceResp = await apiService.requestNonce(walletAddress);
      if (!nonceResp.success || !nonceResp.data?.nonce) {
        Alert.alert('Error', nonceResp.message || 'Failed to get nonce');
        setStep('input');
        return;
      }
      const receivedNonce = nonceResp.data.nonce;
      setNonce(receivedNonce);

      const message = `Welcome to FitFi!\n\nSign this message to verify your identity.\n\nNonce: ${receivedNonce}`;
      console.log('📝 Message to sign:', message);

      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await handleWebWalletSigning(message, receivedNonce);
      } else {
        await handleWalletConnectSigning(message, receivedNonce);
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  // OTP flow removed

  const handleWebWalletSigning = async (
    message: string,
    nonceValue: number
  ) => {
    try {
      console.log('🌐 Web: Requesting signature from MetaMask...');

      const ethereum = (window as any).ethereum;

      // Request accounts first
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const connectedAddress = accounts[0];

      // Verify the connected address matches what user entered
      if (connectedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(
          `Connected wallet address (${connectedAddress}) doesn't match entered address (${walletAddress}). Please connect the correct wallet.`
        );
      }

      // Sign the message using web3
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, connectedAddress],
      });

      console.log('✅ Web: Got signature from MetaMask');

      // Determine chain id (optional)
      let chainIdStr: string | undefined;
      try {
        const chainHex = await ethereum.request({ method: 'eth_chainId' });
        const chainDec = parseInt(chainHex, 16);
        if (!isNaN(chainDec)) chainIdStr = `eip155:${chainDec}`;
      } catch {}

      // Step 3: Verify with backend
      await verifySignatureWithBackend(
        connectedAddress,
        signature,
        nonceValue,
        'personal_sign',
        chainIdStr
      );
    } catch (error: any) {
      console.error('❌ Web wallet signing error:', error);

      if (error.code === 4001) {
        // User rejected the request
        Alert.alert('Cancelled', 'Wallet signature was cancelled by user.');
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to sign message with wallet'
        );
      }

      setStep('input');
      throw error;
    }
  };

  const handleDemoLogin = async () => {
    if (!ENV.IS_DEV) {
      Alert.alert('Error', 'Demo login is only available in development mode');
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      const demoWallet = '0x1234567890123456789012345678901234567890';
      setWalletAddress(demoWallet);

      console.log('📡 Demo: Requesting nonce for wallet:', demoWallet);

      const nonceResponse = await apiService.requestNonce(demoWallet);

      if (!nonceResponse.success) {
        Alert.alert('Error', nonceResponse.message || 'Failed to get nonce');
        setStep('input');
        return;
      }

      const receivedNonce = nonceResponse.data?.nonce;
      if (!receivedNonce) {
        Alert.alert('Error', 'No nonce received from server');
        setStep('input');
        return;
      }
      setNonce(receivedNonce);

      // Create demo signature
      const demoSignature = `0x${'mock'.repeat(16)}${receivedNonce
        .toString()
        .padStart(8, '0')}`;

      console.log('🔐 Demo: Verifying with mock signature...');

      await verifySignatureWithBackend(
        demoWallet,
        demoSignature,
        receivedNonce
      );
    } catch (error) {
      console.error('❌ Demo login error:', error);
      Alert.alert('Error', 'Demo login failed. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkTest = async () => {
    try {
      setLoading(true);
      Alert.alert(
        'Network Test',
        'Running network diagnostics... Check console for detailed results.'
      );

      const results = await NetworkDiagnostics.runFullDiagnostics();

      const summary = results
        .map((r) => `${r.success ? '✅' : '❌'} ${r.test}: ${r.message}`)
        .join('\n');

      Alert.alert('Network Test Results', summary, [
        { text: 'OK', style: 'default' },
      ]);
    } catch (error) {
      console.error('Network test error:', error);
      Alert.alert('Error', 'Network test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setWalletAddress('');
    setNonce(null);
  };

  const handleWalletConnectSigning = async (
    message: string,
    nonceValue: number
  ) => {
    try {
      console.log('📱 Mobile: Using WalletConnect v2 for signing...');

      // Import WalletConnect service
      const { WalletConnectService } = await import(
        '../utils/WalletConnectService'
      );

      // Connect to wallet and sign message directly
      const { signature, address, method, chainId } =
        await WalletConnectService.connectAndSign(message, nonceValue);

      console.log('✅ Mobile: Got signature from WalletConnect');

      // If user typed an address, ensure it matches the connected wallet
      if (
        walletAddress &&
        walletAddress.toLowerCase() !== address.toLowerCase()
      ) {
        Alert.alert(
          'Address Mismatch',
          `Connected wallet (${address}) doesn't match entered address (${walletAddress}). Using connected wallet.`
        );
      }

      // Verify with backend using the connected address
      await verifySignatureWithBackend(
        address,
        signature,
        nonceValue,
        method,
        chainId
      );
    } catch (error: any) {
      console.error('❌ WalletConnect signing error:', error);

      if (error.message.includes('User rejected')) {
        Alert.alert('Cancelled', 'Wallet connection was cancelled by user.');
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to connect or sign with wallet'
        );
      }

      setStep('input');
      throw error;
    }
  };

  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Connect Your Wallet</Text>
      <Text style={styles.stepDescription}>
        Enter your wallet address to securely connect and authenticate with
        FitFi
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Wallet Address</Text>
        <TextInput
          style={styles.textInput}
          value={walletAddress}
          onChangeText={setWalletAddress}
          placeholder='0x...'
          placeholderTextColor='#9ca3af'
          autoCapitalize='none'
          autoCorrect={false}
          multiline={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleConnectWallet}
        disabled={loading || !walletAddress}
      >
        {loading ? (
          <ActivityIndicator color='#ffffff' />
        ) : (
          <Text style={styles.primaryButtonText}>Connect Wallet</Text>
        )}
      </TouchableOpacity>

      {ENV.IS_DEV && (
        <>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Demo Login (Dev Only)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: '#ef4444' }]}
            onPress={handleNetworkTest}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>🔧 Network Test</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Connecting Wallet...</Text>
      <Text style={styles.stepDescription}>
        {typeof window !== 'undefined' && (window as any).ethereum
          ? 'MetaMask will open automatically. Please sign the message to authenticate.'
          : 'A wallet app will open via WalletConnect. Approve the connection and sign the message to authenticate.'}
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Wallet Address:</Text>
        <Text style={styles.infoValue}>{walletAddress}</Text>

        {nonce && (
          <>
            <Text style={styles.infoLabel}>Nonce:</Text>
            <Text style={styles.infoValue}>{nonce}</Text>
          </>
        )}
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#667eea' />
        <Text style={styles.loadingText}>Processing authentication...</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleReset}>
        <Text style={styles.backButtonText}>← Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to FitFi</Text>
        <Text style={styles.subtitle}>Connect your wallet to continue</Text>
      </View>

      {step === 'input' && renderInputStep()}
      {step === 'processing' && renderProcessingStep()}
    </ScrollView>
  );
}

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 50,
  },
  signatureInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  messageLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    marginTop: 16,
  },
  messageContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f9fafb',
    minHeight: 50,
  },
  signatureInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoContainer: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    fontFamily: 'monospace',
  },
  messageLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
    marginTop: 16,
  },
  messageContainer: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  messageText: {
    fontSize: 14,
    color: '#f1f5f9',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cbd5e1',
  },
});
