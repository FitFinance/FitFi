import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateProfile(name.trim());

      if (response.success) {
        Alert.alert(
          'Welcome to FitFi!',
          'Your profile has been set up successfully. You can now start tracking your fitness journey.',
          [
            {
              text: 'Get Started',
              onPress: () => router.replace('/(tabs)/home'),
            },
          ]
        );
      } else {
        Alert.alert(
          response.details?.title || 'Profile Update Failed',
          response.details?.description || response.message
        );
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert(
        'Setup Error',
        'An unexpected error occurred while setting up your profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can always update your profile later from the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>👋</Text>
              </View>
              <Text style={styles.title}>Welcome to FitFi!</Text>
              <Text style={styles.subtitle}>
                Let&apos;s set up your profile
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Connected Wallet:</Text>
              <Text style={styles.walletAddress}>{user?.walletAddress}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>What should we call you?</Text>
              <TextInput
                style={[GlobalStyles.input, styles.input]}
                value={name}
                onChangeText={setName}
                placeholder='Enter your name or nickname'
                placeholderTextColor={Colors.dark.textMuted}
                autoCapitalize='words'
                autoCorrect={false}
                maxLength={50}
              />
              <Text style={styles.helperText}>
                This is how you&apos;ll appear to other users in challenges and
                leaderboards.
              </Text>
            </View>

            <TouchableOpacity
              style={[GlobalStyles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonTextPrimary}>
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, styles.marginTop]}
              onPress={handleSkip}
            >
              <Text style={GlobalStyles.buttonText}>Skip for Now</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Privacy Note</Text>
              <Text style={styles.infoText}>
                Your wallet address is used for authentication and blockchain
                transactions. Your display name is only used within the app and
                can be changed anytime.
              </Text>
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
  },
  title: {
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
  walletInfo: {
    backgroundColor: Colors.dark.surfaceSecondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: Colors.dark.text,
    fontFamily: 'monospace',
    backgroundColor: Colors.dark.surface,
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    lineHeight: 16,
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
    borderLeftColor: Colors.dark.info,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
};
