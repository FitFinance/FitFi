import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ConnectWalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>💎</Text>
          <Text style={styles.title}>Welcome to FitFi</Text>
          <Text style={styles.subtitle}>
            Connect your wallet to start earning FITFI tokens through fitness
            challenges and duels
          </Text>
        </View>

        <View style={styles.walletOptions}>
          <TouchableOpacity style={[styles.walletButton, styles.primaryWallet]}>
            <Text style={styles.walletIcon}>🦊</Text>
            <Text style={styles.walletText}>MetaMask</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.walletIcon}>👛</Text>
            <Text style={styles.walletText}>WalletConnect</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.walletIcon}>🔗</Text>
            <Text style={styles.walletText}>Coinbase Wallet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  walletOptions: {
    gap: 16,
    marginBottom: 32,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryWallet: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  walletIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  walletText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});
