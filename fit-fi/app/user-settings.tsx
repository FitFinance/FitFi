import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function UserSettingsScreen() {
  const router = useRouter();

  const mockUserProfile = {
    name: 'Alex Fitness',
    username: '@alexfitness',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    level: 12,
    experience: 8450,
    nextLevelExp: 10000,
    totalEarnings: 1250.50,
    joinedDate: 'January 2024',
    totalSteps: 1452300,
    totalChallenges: 48,
    challengesWon: 32,
    winRate: 67,
    currentStreak: 7,
    longestStreak: 15,
  };

  const mockGoals = {
    dailySteps: 10000,
    weeklyDistance: 50, // km
    monthlyCalories: 15000,
    yearlyDuels: 100,
  };

  const mockAchievements = [
    { id: '1', title: 'Early Adopter', icon: '🏅', description: 'Joined in the first month' },
    { id: '2', title: 'Step Master', icon: '👟', description: 'Walked 1M+ steps' },
    { id: '3', title: 'Duel Champion', icon: '⚔️', description: 'Won 25+ duels' },
    { id: '4', title: 'Streak Keeper', icon: '🔥', description: '7-day active streak' },
  ];

  const expProgress = (mockUserProfile.experience / mockUserProfile.nextLevelExp) * 100;

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const GoalCard = ({ title, current, target, unit }: { title: string; current: number; target: number; unit: string }) => {
    const progress = (current / target) * 100;
    return (
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>{title}</Text>
        <View style={styles.goalProgress}>
          <View style={GlobalStyles.progressBar}>
            <View style={[GlobalStyles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.goalText}>
            {current.toLocaleString()} / {target.toLocaleString()} {unit} ({Math.round(progress)}%)
          </Text>
        </View>
      </View>
    );
  };

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
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AF</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{mockUserProfile.level}</Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUserProfile.name}</Text>
            <Text style={styles.profileUsername}>{mockUserProfile.username}</Text>
            <Text style={styles.profileAddress}>
              {mockUserProfile.walletAddress.slice(0, 6)}...{mockUserProfile.walletAddress.slice(-4)}
            </Text>
            <Text style={styles.joinedDate}>Joined {mockUserProfile.joinedDate}</Text>
          </View>

          <View style={styles.experienceSection}>
            <Text style={styles.experienceTitle}>Level Progress</Text>
            <View style={styles.experienceBar}>
              <View style={GlobalStyles.progressBar}>
                <View style={[GlobalStyles.progressFill, { width: `${expProgress}%` }]} />
              </View>
              <Text style={styles.experienceText}>
                {mockUserProfile.experience.toLocaleString()} / {mockUserProfile.nextLevelExp.toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Steps"
              value={mockUserProfile.totalSteps.toLocaleString()}
              subtitle="All time"
            />
            <StatCard
              title="Challenges"
              value={mockUserProfile.totalChallenges}
              subtitle="Completed"
            />
            <StatCard
              title="Win Rate"
              value={`${mockUserProfile.winRate}%`}
              subtitle={`${mockUserProfile.challengesWon}/${mockUserProfile.totalChallenges}`}
            />
            <StatCard
              title="Current Streak"
              value={mockUserProfile.currentStreak}
              subtitle="days"
            />
            <StatCard
              title="Total Earnings"
              value={`${mockUserProfile.totalEarnings} FF`}
              subtitle="Lifetime"
            />
            <StatCard
              title="Longest Streak"
              value={mockUserProfile.longestStreak}
              subtitle="days"
            />
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Goals</Text>
          <GoalCard
            title="Daily Steps"
            current={8420}
            target={mockGoals.dailySteps}
            unit="steps"
          />
          <GoalCard
            title="Weekly Distance"
            current={32.5}
            target={mockGoals.weeklyDistance}
            unit="km"
          />
          <GoalCard
            title="Monthly Calories"
            current={8900}
            target={mockGoals.monthlyCalories}
            unit="cal"
          />
          <GoalCard
            title="Yearly Duels"
            current={42}
            target={mockGoals.yearlyDuels}
            unit="duels"
          />
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {mockAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={GlobalStyles.buttonSecondary}>
              <Text style={GlobalStyles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.buttonSecondary}>
              <Text style={GlobalStyles.buttonText}>Update Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.buttonSecondary}>
              <Text style={GlobalStyles.buttonText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  placeholder: {
    width: 60, // Same width as back button for centering
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
  profileUsername: {
    fontSize: 16,
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
  goalCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  goalProgress: {
    width: '100%',
  },
  goalText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionButtons: {
    gap: 12,
  },
};
