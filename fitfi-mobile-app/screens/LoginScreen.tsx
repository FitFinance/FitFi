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
  // Nonce state no longer used in OTP-only flow
  const [otp, setOtp] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'processing' | 'otp'>('input');

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

      console.log(
        '📡 Step 1: Requesting OTP/signup status for wallet:',
        walletAddress
      );

      // Step 1: Request OTP (works for both new and existing users)
      const otpResp = await apiService.requestOtp(walletAddress);
      if (!otpResp.success) {
        Alert.alert('Error', otpResp.message || 'Failed to request OTP');
        setStep('input');
        return;
      }
      // Show OTP entry UI (for both new and existing users)
      setTxHash(otpResp.data?.txHash || null);
      setDevOtp((otpResp.data as any)?.devOtp || null);
      setStep('otp');
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!otp || otp.trim().length < 4) {
        Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
        return;
      }
      setLoading(true);
      const verifyResp = await apiService.verifyOtp(walletAddress, otp.trim());
      if (!verifyResp.success || !verifyResp.data?.token) {
        Alert.alert(
          'Verification Failed',
          verifyResp.message || 'Invalid or expired OTP'
        );
        setStep('input');
        return;
      }
      const { token, walletAddress: w, nonce: n } = verifyResp.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('walletAddress', w);
      apiService.setAuthToken(token);
      setNonce(n);
      Alert.alert('Success', 'Signed up and logged in!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (e) {
      console.error('OTP verify error', e);
      Alert.alert('Error', 'Failed to verify OTP.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  // Signature-based flows are disabled for now

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

      console.log('📡 Demo: Requesting OTP for wallet:', demoWallet);

      const otpResp = await apiService.requestOtp(demoWallet);

      if (!otpResp.success) {
        Alert.alert('Error', otpResp.message || 'Failed to request OTP');
        setStep('input');
        return;
      }

      setTxHash(otpResp.data?.txHash || null);
      const dev = (otpResp.data as any)?.devOtp as string | undefined;
      if (dev) {
        // Auto-fill and verify in dev for speed
        setOtp(dev);
        await new Promise((r) => setTimeout(r, 300));
        await handleVerifyOtp();
      } else {
        setStep('otp');
      }
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
    // no-op
  };

  // Signature-based flows are disabled for now

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
      <Text style={styles.stepTitle}>Sending OTP...</Text>
      <Text style={styles.stepDescription}>
        We&apos;ll emit a one-time code to your wallet address using an on-chain
        event. Enter that code on the next screen to continue.
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Wallet Address:</Text>
        <Text style={styles.infoValue}>{walletAddress}</Text>

        {txHash && (
          <>
            <Text style={styles.infoLabel}>Tx Hash:</Text>
            <Text style={styles.infoValue}>{txHash}</Text>
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
      {step === 'otp' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Enter OTP</Text>
          <Text style={styles.stepDescription}>
            An OTP was issued via an on-chain event to your wallet. Enter the
            6-digit code shown in the wallet/app.
          </Text>
          {txHash && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Transaction:</Text>
              <Text style={styles.infoValue}>{txHash}</Text>
            </View>
          )}
          {ENV.IS_DEV && devOtp && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Dev OTP (debug only):</Text>
              <Text style={styles.infoValue}>{devOtp}</Text>
              <TouchableOpacity
                style={[styles.demoButton, { marginTop: 12 }]}
                onPress={() => setOtp(devOtp)}
              >
                <Text style={styles.demoButtonText}>Use Dev OTP</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>OTP Code</Text>
            <TextInput
              style={styles.textInput}
              value={otp}
              onChangeText={setOtp}
              placeholder='Enter 6-digit code'
              placeholderTextColor='#9ca3af'
              keyboardType='number-pad'
              autoCapitalize='none'
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleVerifyOtp}
            disabled={loading || !otp}
          >
            {loading ? (
              <ActivityIndicator color='#ffffff' />
            ) : (
              <Text style={styles.primaryButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.demoButton,
              { backgroundColor: '#64748b', marginTop: 8 },
            ]}
            onPress={handleConnectWallet}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Resend OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleReset}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
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
