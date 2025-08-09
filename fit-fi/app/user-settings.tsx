import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function UserSettingsScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data for now - in a real app, this would come from the backend
  const mockStats = {
    level: 12,
    experience: 8450,
    nextLevelExp: 10000,
    totalEarnings: 1250.5,
    joinedDate: 'January 2024',
    totalSteps: 1452300,
    totalChallenges: 48,
    challengesWon: 32,
    winRate: 67,
    currentStreak: 7,
    longestStreak: 15,
  };

  const handleEditProfile = () => {
    setEditName(user?.name || '');
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await updateProfile(editName.trim());

      if (response.success) {
        setIsEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert(
          response.details?.title || 'Update Failed',
          response.details?.description || response.message
        );
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to reconnect your wallet to access the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const expProgress = (mockStats.experience / mockStats.nextLevelExp) * 100;

  const StatCard = ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={GlobalStyles.title}>Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{mockStats.level}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Anonymous'}</Text>
            <Text style={styles.profileRole}>Role: {user?.role || 'User'}</Text>
            <Text style={styles.profileAddress}>
              {user?.walletAddress
                ? `${user.walletAddress.slice(
                    0,
                    6
                  )}...${user.walletAddress.slice(-4)}`
                : 'No wallet connected'}
            </Text>
            <Text style={styles.joinedDate}>Joined {mockStats.joinedDate}</Text>
          </View>

          <View style={styles.experienceSection}>
            <Text style={styles.experienceTitle}>Level Progress</Text>
            <View style={styles.experienceBar}>
              <View style={GlobalStyles.progressBar}>
                <View
                  style={[
                    GlobalStyles.progressFill,
                    { width: `${expProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.experienceText}>
                {mockStats.experience.toLocaleString()} /{' '}
                {mockStats.nextLevelExp.toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Connected Wallet:</Text>
            <Text style={styles.walletAddress}>
              {user?.walletAddress || 'No wallet connected'}
            </Text>
            <Text style={styles.walletNote}>🦊 Authenticated via MetaMask</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title='Total Steps'
              value={mockStats.totalSteps.toLocaleString()}
              subtitle='All time'
            />
            <StatCard
              title='Challenges'
              value={mockStats.totalChallenges}
              subtitle='Completed'
            />
            <StatCard
              title='Win Rate'
              value={`${mockStats.winRate}%`}
              subtitle={`${mockStats.challengesWon}/${mockStats.totalChallenges}`}
            />
            <StatCard
              title='Current Streak'
              value={mockStats.currentStreak}
              subtitle='days'
            />
            <StatCard
              title='Total Earnings'
              value={`${mockStats.totalEarnings} FF`}
              subtitle='Lifetime'
            />
            <StatCard
              title='Longest Streak'
              value={mockStats.longestStreak}
              subtitle='days'
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={GlobalStyles.button}
              onPress={handleEditProfile}
            >
              <Text style={GlobalStyles.buttonTextPrimary}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.buttonSecondary}>
              <Text style={GlobalStyles.buttonText}>Update Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.buttonSecondary}>
              <Text style={GlobalStyles.buttonText}>Share Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                GlobalStyles.buttonSecondary,
                { borderColor: Colors.dark.error, borderWidth: 1 },
              ]}
              onPress={handleLogout}
            >
              <Text
                style={[GlobalStyles.buttonText, { color: Colors.dark.error }]}
              >
                Disconnect Wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Display Name</Text>
              <TextInput
                style={GlobalStyles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder='Enter your name'
                placeholderTextColor={Colors.dark.textMuted}
                maxLength={50}
              />
              <Text style={styles.modalHelperText}>
                This is how you&apos;ll appear to other users
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  GlobalStyles.buttonSecondary,
                  { flex: 1, marginRight: 8 },
                ]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={GlobalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  GlobalStyles.button,
                  { flex: 1, marginLeft: 8 },
                  isUpdating && styles.buttonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <Text style={GlobalStyles.buttonTextPrimary}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.dark.error,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.dark.accent,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: Colors.dark.surface,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  experienceSection: {
    width: '100%',
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  experienceBar: {
    width: '100%',
  },
  experienceText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F6851B', // MetaMask orange
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  walletNote: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  modalHelperText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};
