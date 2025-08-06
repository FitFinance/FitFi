import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Test API connection when component mounts
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const isConnected = await apiService.testConnection();
      console.log('API Connection:', isConnected ? 'Connected' : 'Failed');

      // If connected, try to get user profile (this will fail without auth token)
      if (isConnected) {
        const profile = await apiService.getProfile();
        if (profile.success) {
          setUserData(profile.data);
        }
      }
    } catch (error) {
      console.error('API test failed:', error);
    } finally {
      setLoading(false);
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

      {/* Stats Cards - Using placeholder data since we don't have health data API yet */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statNumber}>10,247</Text>
          <Text style={styles.statLabel}>Steps Today (Mock)</Text>
          <View style={styles.statProgress}>
            <View style={[styles.progressBar, { width: '75%' }]} />
          </View>
        </View>

        <View style={styles.miniStatsRow}>
          <View style={[styles.miniStatCard, styles.calorieCard]}>
            <Text style={styles.miniStatNumber}>547</Text>
            <Text style={styles.miniStatLabel}>Calories (Mock)</Text>
          </View>
          <View style={[styles.miniStatCard, styles.timeCard]}>
            <Text style={styles.miniStatNumber}>1h 23m</Text>
            <Text style={styles.miniStatLabel}>Active Time (Mock)</Text>
          </View>
        </View>
      </View>

      {/* Active Challenges Section - Placeholder data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Active Challenges (Mock)</Text>
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Weekly Step Challenge</Text>
            <Text style={styles.challengeReward}>+50 FITFI</Text>
          </View>
          <Text style={styles.challengeProgress}>6/7 days completed</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.challengeProgressBar, { width: '85%' }]} />
          </View>
        </View>
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

      {/* Recent Duels Section - Placeholder data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚔️ Recent Duels (Mock)</Text>
        <View style={styles.duelCard}>
          <View style={styles.duelInfo}>
            <Text style={styles.duelOpponent}>vs. Sarah Johnson</Text>
            <Text style={styles.duelResult}>Victory +25 FITFI</Text>
          </View>
          <View style={styles.duelStats}>
            <Text style={styles.duelStatText}>12,340 steps</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Duels</Text>
        </TouchableOpacity>
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
});
