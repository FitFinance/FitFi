import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function LoginScreen() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'wallet' | 'otp'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if already logged in
    const checkToken = async () => {
      // Placeholder: Check stored token
      const hasToken = false;
      if (hasToken) {
        router.replace('/(tabs)/home');
      }
    };
    checkToken();
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleWalletSubmit = async () => {
    if (!walletAddress.trim()) {
      Alert.alert('Error', 'Please enter your wallet address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('otp');
      setCountdown(300); // 5 minutes
      Alert.alert('Success', 'OTP has been sent to your wallet. Please check and enter the code.');
    } catch {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Store token (placeholder)
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    Alert.alert(
      'Demo Login',
      'This will log you in with demo credentials',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => router.replace('/(tabs)/home')
        },
      ]
    );
  };

  const handleNetworkDiagnostics = () => {
    Alert.alert('Network Diagnostics', 'This feature is available in development mode');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>FF</Text>
              </View>
              <Text style={styles.appName}>FitFi</Text>
              <Text style={styles.subtitle}>Login to your account</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {step === 'wallet' ? (
              <>
                <Text style={styles.label}>Wallet Address</Text>
                <TextInput
                  style={[GlobalStyles.input, styles.input]}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  placeholder="Enter your wallet address"
                  placeholderTextColor={Colors.dark.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={[GlobalStyles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleWalletSubmit}
                  disabled={isLoading}
                >
                  <Text style={GlobalStyles.buttonTextPrimary}>
                    {isLoading ? 'Requesting OTP...' : 'Request OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[GlobalStyles.buttonSecondary, styles.marginTop]}
                  onPress={() => router.push('/connect-wallet')}
                >
                  <Text style={GlobalStyles.buttonText}>Connect Wallet Instead</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Enter OTP Code</Text>
                <Text style={styles.otpInfo}>
                  We&apos;ve sent a verification code to your wallet address
                </Text>
                <Text style={styles.walletAddressDisplay}>{walletAddress}</Text>

                <TextInput
                  style={[GlobalStyles.input, styles.input]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={Colors.dark.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                {countdown > 0 && (
                  <Text style={styles.countdown}>
                    Code expires in: {formatTime(countdown)}
                  </Text>
                )}

                <TouchableOpacity
                  style={[GlobalStyles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleOtpSubmit}
                  disabled={isLoading}
                >
                  <Text style={GlobalStyles.buttonTextPrimary}>
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[GlobalStyles.buttonSecondary, styles.marginTop]}
                  onPress={() => setStep('wallet')}
                >
                  <Text style={GlobalStyles.buttonText}>Back to Wallet</Text>
                </TouchableOpacity>

                {countdown === 0 && (
                  <TouchableOpacity
                    style={[GlobalStyles.buttonSecondary, styles.marginTop]}
                    onPress={handleWalletSubmit}
                  >
                    <Text style={GlobalStyles.buttonText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={styles.devSection}>
              <Text style={styles.devTitle}>Development Tools</Text>
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.devButton]}
                onPress={handleDemoLogin}
              >
                <Text style={GlobalStyles.buttonText}>Demo Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.devButton]}
                onPress={handleNetworkDiagnostics}
              >
                <Text style={GlobalStyles.buttonText}>Network Diagnostics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  marginTop: {
    marginTop: 12,
  },
  otpInfo: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  walletAddressDisplay: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontFamily: 'monospace',
    marginBottom: 20,
    padding: 8,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 4,
  },
  countdown: {
    fontSize: 14,
    color: Colors.dark.warning,
    textAlign: 'center',
    marginBottom: 16,
  },
  devSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  devTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  devButton: {
    marginBottom: 8,
  },
};
