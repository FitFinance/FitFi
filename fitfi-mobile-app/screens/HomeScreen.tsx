import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';
import { ENV } from '../utils/config';
import { apiService } from '../utils/ApiService';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [duelsData, setDuelsData] = useState([]);
  const [challengesData, setChallengesData] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [healthData, setHealthData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Initialize authentication before making API calls
      await apiService.initializeAuth();

      await Promise.all([
        loadUserProfile(),
        loadDuels(),
        loadChallenges(),
        loadAvailableChallenges(),
        loadHealthData(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      if (profile.success) {
        setUserData(profile.data);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadDuels = async () => {
    try {
      const duels = await apiService.getDuels();
      if (duels.success) {
        setDuelsData(duels.data || []);
      }
    } catch (error) {
      console.error('Failed to load duels:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const challenges = await apiService.getChallenges();
      if (challenges.success) {
        setChallengesData(challenges.data || []);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const loadHealthData = async () => {
    try {
      // This would be replaced with actual health data API call
      // For now, show no data instead of mock data
      setHealthData(null);
    } catch (error) {
      console.error('Failed to load health data:', error);
    }
  };

  const loadAvailableChallenges = async () => {
    try {
      const response = await apiService.getAvailableChallenges();
      if (response.success && response.data) {
        setAvailableChallenges(response.data);
      }
    } catch (error) {
      console.error('Failed to load available challenges:', error);
      setAvailableChallenges([]);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      // Note: The backend doesn't currently have a join challenge endpoint
      // For now, we'll just show a message
      console.log('Challenge join requested for:', challengeId);
      console.log(
        'Note: Join challenge functionality needs to be implemented in the backend'
      );

      // TODO: Implement actual join challenge API call when backend supports it
      // const response = await apiService.joinChallenge(challengeId);
      // if (response.success) {
      //   await loadChallenges();
      //   await loadAvailableChallenges();
      //   console.log('Successfully joined challenge!');
      // } else {
      //   console.error('Failed to join challenge:', response.message);
      // }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with User Stats */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.username}>
              {userData?.username || 'Guest User'}
            </Text>
            {loading && (
              <ActivityIndicator
                size='small'
                color='#667eea'
                style={{ marginTop: 4 }}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => router.push('/user-settings')}
          >
            <Text style={styles.settingsEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards - Real health data (when available) */}
      <View style={styles.statsContainer}>
        {healthData ? (
          <>
            <View style={[styles.statCard, styles.primaryCard]}>
              <Text style={styles.statNumber}>
                {healthData.steps?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Steps Today</Text>
              <View style={styles.statProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min((healthData.steps / 10000) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.miniStatsRow}>
              <View style={[styles.miniStatCard, styles.calorieCard]}>
                <Text style={styles.miniStatNumber}>
                  {healthData.calories || '0'}
                </Text>
                <Text style={styles.miniStatLabel}>Calories</Text>
              </View>
              <View style={[styles.miniStatCard, styles.timeCard]}>
                <Text style={styles.miniStatNumber}>
                  {healthData.activeTime || '0m'}
                </Text>
                <Text style={styles.miniStatLabel}>Active Time</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>No Health Data Available</Text>
            <Text style={styles.statSubtext}>
              Connect a fitness tracker to see your stats
            </Text>
          </View>
        )}
      </View>

      {/* Active Challenges Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Active Challenges</Text>
        {challengesData.length > 0 ? (
          challengesData.slice(0, 2).map((challenge: any, index: number) => (
            <View key={index} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>
                  {challenge.title || 'Challenge'}
                </Text>
                <Text style={styles.challengeReward}>
                  +{challenge.reward || '0'} FITFI
                </Text>
              </View>
              <Text style={styles.challengeProgress}>
                {challenge.progress || 'In Progress'}
              </Text>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.challengeProgressBar,
                    { width: `${challenge.progressPercentage || 0}%` },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.challengeCard}>
            <Text style={styles.emptyStateText}>No active challenges</Text>
            <Text style={styles.emptyStateSubtext}>
              Join a challenge to start earning rewards!
            </Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Browse Challenges</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Available Challenges Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Available Challenges</Text>
          <TouchableOpacity onPress={() => router.push('/challenges')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {availableChallenges.length > 0 ? (
          availableChallenges
            .slice(0, 3)
            .map((challenge: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.availableChallengeCard}
                onPress={() => joinChallenge(challenge._id)}
              >
                <View style={styles.challengeContent}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>
                      {challenge.title ||
                        `${challenge.challengeType} Challenge`}
                    </Text>
                    <Text style={styles.challengeDescription}>
                      {challenge.description ||
                        `Complete ${challenge.target} ${challenge.challengeType} in ${challenge.duration}h`}
                    </Text>
                    <View style={styles.challengeDetails}>
                      <Text style={styles.challengeTarget}>
                        🎯 {challenge.target?.toLocaleString()}
                      </Text>
                      <Text style={styles.challengeDuration}>
                        ⏱️ {challenge.duration}h
                      </Text>
                    </View>
                  </View>
                  <View style={styles.challengeRewardSection}>
                    <Text style={styles.challengeReward}>
                      +{challenge.reward || 10} FITFI
                    </Text>
                    <View style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>Join</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.challengeCard}>
            <Text style={styles.emptyStateText}>No challenges available</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for new challenges!
            </Text>
          </View>
        )}
      </View>

      {/* Development Debug Panel - Only shown in development */}
      {ENV.SHOW_DEV_COMPONENTS && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Development Debug</Text>
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Environment: {ENV.NODE_ENV}</Text>
            <Text style={styles.debugText}>API URL: {ENV.API_URL}</Text>
            <Text style={styles.debugText}>WebSocket: {ENV.WS_URL}</Text>
            <Text style={styles.debugText}>
              Health Connect:{' '}
              {ENV.HEALTH_CONNECT_ENABLED ? 'Enabled' : 'Disabled'}
            </Text>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => console.log('Debug info logged')}
            >
              <Text style={styles.debugButtonText}>Log Debug Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Duels Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚔️ Recent Duels</Text>
        {duelsData.length > 0 ? (
          <>
            {duelsData.slice(0, 3).map((duel: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.duelCard}
                onPress={() => router.push(`/duel-details?id=${duel._id}`)}
              >
                <View style={styles.duelInfo}>
                  <Text style={styles.duelOpponent}>
                    vs. {duel.opponent?.username || 'Unknown Player'}
                  </Text>
                  <Text style={styles.duelResult}>
                    {duel.status === 'completed'
                      ? duel.winner
                        ? 'Victory'
                        : 'Defeat'
                      : duel.status}
                    {duel.reward && ` +${duel.reward} FITFI`}
                  </Text>
                </View>
                <View style={styles.duelStats}>
                  <Text style={styles.duelStatText}>
                    {duel.yourStats || 'In Progress'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Duels</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.duelCard}>
            <Text style={styles.emptyStateText}>No recent duels</Text>
            <Text style={styles.emptyStateSubtext}>
              Start your first duel to compete with other players!
            </Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Find Opponents</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsEmoji: {
    fontSize: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  primaryCard: {
    backgroundColor: '#667eea',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  statProgress: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
  },
  calorieCard: {
    backgroundColor: '#ff6b6b',
  },
  timeCard: {
    backgroundColor: '#4ecdc4',
  },
  miniStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  challengeProgress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  duelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  duelInfo: {
    flex: 1,
  },
  duelOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  duelResult: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  duelStats: {
    alignItems: 'flex-end',
  },
  duelStatText: {
    fontSize: 14,
    color: '#64748b',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  debugCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  debugButton: {
    backgroundColor: '#fd79a8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 2,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsEmoji: {
    fontSize: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  primaryCard: {
    backgroundColor: '#4f46e5',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  statProgress: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
  },
  calorieCard: {
    backgroundColor: '#dc2626',
  },
  timeCard: {
    backgroundColor: '#059669',
  },
  miniStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  challengeProgress: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#475569',
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  duelCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  duelInfo: {
    flex: 1,
  },
  duelOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  duelResult: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  duelStats: {
    alignItems: 'flex-end',
  },
  duelStatText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  debugCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  debugButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  statSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
});
