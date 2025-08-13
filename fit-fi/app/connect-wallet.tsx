import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { connectWallet, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const walletOptions = [
    {
      id: 'walletconnect',
      name: 'Connect Wallet',
      description: 'WalletConnect (MetaMask, Trust, Rainbow, Coinbase...)',
      icon: '🔗',
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Direct MetaMask SDK (fallback to WC)',
      icon: '🦊',
    },
    {
      id: 'trust',
      name: 'Trust Wallet (via WC)',
      description: 'Trust Wallet through WalletConnect',
      icon: '�️',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet (via WC)',
      description: 'Coinbase Wallet through WalletConnect',
      icon: '�',
    },
  ];

  const handleWalletConnect = async (walletId: string) => {
    setError(null);
    try {
      const strategy = walletId === 'metamask' ? 'metamask' : 'walletconnect';
      const res = await connectWallet(strategy);
      if (res.success) {
        router.replace('/(tabs)/home');
      } else {
        setError(res.details?.description || res.message || 'Login failed');
      }
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={GlobalStyles.title}>Connect Wallet</Text>
              <Text style={styles.subtitle}>
                Choose your preferred wallet to connect to FitFi
              </Text>
            </View>
          </View>

          <View style={styles.walletList}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {walletOptions.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => !isLoading && handleWalletConnect(wallet.id)}
              >
                <View style={styles.walletIcon}>
                  <Text style={styles.iconText}>{wallet.icon}</Text>
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text style={styles.walletDescription}>
                    {wallet.description}
                  </Text>
                </View>
                <Text style={styles.arrow}>{isLoading ? '...' : '→'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Why connect a wallet?</Text>
              <Text style={styles.infoText}>
                • Secure authentication without passwords{'\n'}• Earn and manage
                your FitFi tokens{'\n'}• Participate in challenges and duels
                {'\n'}• Track your fitness achievements on-chain
              </Text>
            </View>

            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, styles.loginButton]}
              onPress={() => router.push('/login')}
            >
              <Text style={GlobalStyles.buttonText}>
                Login with OTP Instead
              </Text>
            </TouchableOpacity>
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
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  walletList: {
    flex: 1,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 20,
    color: Colors.dark.textMuted,
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
  },
  infoBox: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  loginButton: {
    marginTop: 8,
  },
};
