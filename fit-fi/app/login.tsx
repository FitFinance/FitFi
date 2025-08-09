import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
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
      const response = await connectWallet();
      
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

  const handleConnectWalletPage = () => {
    router.push('/connect-wallet');
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
              <Text style={styles.subtitle}>Connect your wallet to get started</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.description}>
              FitFi uses MetaMask to authenticate users and secure your fitness data on the blockchain.
            </Text>

            <TouchableOpacity
              style={[
                GlobalStyles.button, 
                styles.metamaskButton,
                isConnecting && styles.buttonDisabled
              ]}
              onPress={handleWalletConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={GlobalStyles.buttonTextPrimary}>Connecting...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.metamaskIcon}>🦊</Text>
                  <Text style={GlobalStyles.buttonTextPrimary}>Connect MetaMask</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, styles.marginTop]}
              onPress={handleConnectWalletPage}
            >
              <Text style={GlobalStyles.buttonText}>Other Wallet Options</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>New to MetaMask?</Text>
              <Text style={styles.infoText}>
                MetaMask is a secure wallet that lets you connect to blockchain apps. 
                Download the MetaMask mobile app first, create a wallet, then return here to connect.
              </Text>
            </View>

            <View style={styles.devSection}>
              <Text style={styles.devTitle}>Development Tools</Text>
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.devButton]}
                onPress={handleDemoLogin}
              >
                <Text style={GlobalStyles.buttonText}>Demo Login (No Wallet)</Text>
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
  metamaskButton: {
    backgroundColor: '#F6851B', // MetaMask orange
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metamaskIcon: {
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
