import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function HomeScreen() {
  const router = useRouter();

  const mockUser = {
    name: 'Alex Fitness',
    walletAddress: '0x1234...5678',
    level: 12,
    totalSteps: 145230,
    todaySteps: 8420,
    stepGoal: 10000,
    activeDuels: 2,
    totalEarnings: 1250.5,
  };

  const mockHealthStats = {
    calories: 420,
    distance: 6.2,
    activeMinutes: 45,
  };

  const mockActiveChallenges = [
    {
      id: '1',
      title: '10K Steps Daily',
      progress: 84,
      reward: 50,
      timeLeft: '2 days',
    },
    {
      id: '2',
      title: 'Weekend Warrior',
      progress: 60,
      reward: 100,
      timeLeft: '3 days',
    },
  ];

  const mockRecentDuels = [
    {
      id: '1',
      opponent: 'Sarah Runner',
      status: 'won',
      reward: 75,
      steps: 12450,
      date: '2 hours ago',
    },
    {
      id: '2',
      opponent: 'Mike Walker',
      status: 'active',
      stake: 50,
      mySteps: 8420,
      theirSteps: 7890,
      timeLeft: '4h 23m',
    },
  ];

  const stepProgress = (mockUser.todaySteps / mockUser.stepGoal) * 100;

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning! 👋</Text>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userLevel}>Level {mockUser.level}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/user-settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Stats */}
          <View style={[GlobalStyles.card, styles.statsCard]}>
            <Text style={GlobalStyles.heading}>Today&apos;s Progress</Text>
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsNumber}>
                {mockUser.todaySteps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>steps today</Text>
              <View style={styles.progressContainer}>
                <View style={GlobalStyles.progressBar}>
                  <View
                    style={[
                      GlobalStyles.progressFill,
                      { width: `${Math.min(stepProgress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(stepProgress)}% of goal (
                  {mockUser.stepGoal.toLocaleString()})
                </Text>
              </View>
            </View>

            <View style={styles.healthStatsRow}>
              <View style={styles.healthStat}>
                <Text style={styles.healthStatNumber}>
                  {mockHealthStats.calories}
                </Text>
                <Text style={styles.healthStatLabel}>Calories</Text>
              </View>
              <View style={styles.healthStat}>
                <Text style={styles.healthStatNumber}>
                  {mockHealthStats.distance}
                </Text>
                <Text style={styles.healthStatLabel}>km</Text>
              </View>
              <View style={styles.healthStat}>
                <Text style={styles.healthStatNumber}>
                  {mockHealthStats.activeMinutes}
                </Text>
                <Text style={styles.healthStatLabel}>Active min</Text>
              </View>
            </View>
          </View>

          {/* Active Challenges */}
          <View style={styles.section}>
            <View style={GlobalStyles.rowBetween}>
              <Text style={GlobalStyles.heading}>Active Challenges</Text>
              <TouchableOpacity onPress={() => router.push('/challenges')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {mockActiveChallenges.map((challenge) => (
              <View key={challenge.id} style={GlobalStyles.cardSecondary}>
                <View style={GlobalStyles.rowBetween}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeReward}>
                    +{challenge.reward} FF
                  </Text>
                </View>
                <View style={styles.challengeProgress}>
                  <View style={GlobalStyles.progressBar}>
                    <View
                      style={[
                        GlobalStyles.progressFill,
                        { width: `${challenge.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.challengeProgressText}>
                    {challenge.progress}% • {challenge.timeLeft} left
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recent Duels */}
          <View style={styles.section}>
            <View style={GlobalStyles.rowBetween}>
              <Text style={GlobalStyles.heading}>Recent Duels</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/active-duels')}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {mockRecentDuels.map((duel) => (
              <TouchableOpacity
                key={duel.id}
                style={GlobalStyles.cardSecondary}
                onPress={() => router.push(`/duel-details?duelId=${duel.id}`)}
              >
                <View style={GlobalStyles.rowBetween}>
                  <Text style={styles.duelOpponent}>vs {duel.opponent}</Text>
                  <View
                    style={[
                      GlobalStyles.statusBadge,
                      duel.status === 'won'
                        ? GlobalStyles.statusCompleted
                        : duel.status === 'active'
                        ? GlobalStyles.statusActive
                        : GlobalStyles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>{duel.status}</Text>
                  </View>
                </View>

                {duel.status === 'won' ? (
                  <View style={styles.duelResult}>
                    <Text style={styles.duelSteps}>
                      {duel.steps.toLocaleString()} steps
                    </Text>
                    <Text style={styles.duelReward}>
                      +{duel.reward} FF earned
                    </Text>
                    <Text style={styles.duelTime}>{duel.date}</Text>
                  </View>
                ) : (
                  <View style={styles.duelActive}>
                    <Text style={styles.duelSteps}>
                      You: {duel.mySteps.toLocaleString()} • Them:{' '}
                      {duel.theirSteps.toLocaleString()}
                    </Text>
                    <Text style={styles.duelTime}>
                      {duel.timeLeft} remaining
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={GlobalStyles.heading}>Quick Actions</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>🏃</Text>
                <Text style={styles.actionButtonText}>Find Opponents</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/challenges')}
              >
                <Text style={styles.actionButtonIcon}>🎯</Text>
                <Text style={styles.actionButtonText}>Browse Challenges</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Panel (Dev Only) */}
          {__DEV__ && (
            <View style={styles.debugPanel}>
              <Text style={styles.debugTitle}>Debug Panel</Text>
              <TouchableOpacity
                style={GlobalStyles.buttonSecondary}
                onPress={() => router.push('/network-test')}
              >
                <Text style={GlobalStyles.buttonText}>Network Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  statsCard: {
    marginBottom: 24,
  },
  stepsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  stepsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  stepsLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  healthStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  healthStat: {
    alignItems: 'center',
  },
  healthStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  healthStatLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  challengeProgress: {
    marginTop: 8,
  },
  challengeProgressText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  duelOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  duelResult: {
    marginTop: 8,
  },
  duelActive: {
    marginTop: 8,
  },
  duelSteps: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  duelReward: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginBottom: 2,
  },
  duelTime: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 0.48,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  debugPanel: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
};
