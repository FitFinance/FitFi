import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete, then navigate
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      }, 1500); // Show splash for at least 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={[GlobalStyles.centered, styles.container]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../unnamed.png')}
          style={styles.logoImage}
          resizeMode='contain'
        />
        <Text style={styles.appName}>FitFi</Text>
        <Text style={styles.tagline}>Earn by staying fit</Text>
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={Colors.dark.primary} />
        <Text style={styles.loadingText}>
          {isLoading ? 'Checking authentication...' : 'Loading...'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: Colors.dark.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
};
