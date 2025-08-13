import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function LoginScreen() {
  const router = useRouter();
  const { connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await connectWallet('walletconnect');

      if (response.success) {
        Alert.alert(
          response.details?.title || 'Success',
          response.details?.description || response.message,
          [
            {
              text: 'Continue',
              onPress: () => {
                if (response.data?.user?.isNewUser) {
                  // Navigate to profile setup for new users
                  router.replace('/profile-setup');
                } else {
                  // Navigate to main app for existing users
                  router.replace('/(tabs)/home');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          response.details?.title || 'Authentication Failed',
          response.details?.description || response.message
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Connection Error',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDemoLogin = () => {
    Alert.alert('Demo Login', 'This will log you in with demo credentials', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: () => router.replace('/(tabs)/home'),
      },
    ]);
  };

  const handleConnectWalletPage = () => {
    router.push('/connect-wallet');
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../unnamed.png')}
                style={styles.logoImage}
                resizeMode='contain'
              />
              <Text style={styles.appName}>FitFi</Text>
              <Text style={styles.subtitle}>
                Connect your MetaMask wallet to get started
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.description}>
              You&apos;re about to authenticate with{' '}
              <Text style={{ fontWeight: '600' }}>MetaMask</Text> via
              WalletConnect. If MetaMask doesn&apos;t open automatically, open
              it manually and approve the connection. You can also pick a
              different WalletConnect-compatible wallet (Trust, Rainbow,
              Coinbase Wallet, etc.).
            </Text>

            <TouchableOpacity
              style={[
                GlobalStyles.button,
                styles.walletConnectButton,
                isConnecting && styles.buttonDisabled,
              ]}
              onPress={handleWalletConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size='small'
                    color='#FFFFFF'
                    style={{ marginRight: 8 }}
                  />
                  <Text style={GlobalStyles.buttonTextPrimary}>
                    Connecting...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.walletConnectIcon}>🔗</Text>
                  <Text style={GlobalStyles.buttonTextPrimary}>
                    Connect MetaMask
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, styles.marginTop]}
              onPress={handleConnectWalletPage}
            >
              <Text style={GlobalStyles.buttonText}>Use Another Wallet</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Need MetaMask?</Text>
              <Text style={styles.infoText}>
                Install MetaMask (or another WalletConnect-compatible wallet).
                Open it once so it finishes setup. Then tap Connect MetaMask
                above. You will only sign a message – no gas or transaction
                fees.
              </Text>
              <Text
                style={[styles.infoText, { marginTop: 8, fontStyle: 'italic' }]}
              >
                Powered by WalletConnect • EVM accounts only (Ethereum mainnet)
              </Text>
            </View>

            <View style={styles.devSection}>
              <Text style={styles.devTitle}>Development Tools</Text>
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.devButton]}
                onPress={handleDemoLogin}
              >
                <Text style={GlobalStyles.buttonText}>
                  Demo Login (No Wallet)
                </Text>
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
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  walletConnectButton: {
    backgroundColor: '#3396FF', // WalletConnect blue
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletConnectIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  marginTop: {
    marginTop: 12,
  },
  infoSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
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
