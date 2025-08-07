import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';
import { apiService } from '../utils/ApiService';

export default function ActiveDuelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActiveDuels();
  }, []);

  const loadActiveDuels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize authentication before making API calls
      await apiService.initializeAuth();

      const response = await apiService.getDuels();

      if (response.success && response.data) {
        // Filter only active duels
        const activeDuels = response.data.filter(
          (duel) =>
            duel.status === 'active' ||
            duel.status === 'pending' ||
            duel.status === 'searching' ||
            duel.status === 'accepted'
        );
        setDuels(activeDuels);
      } else {
        if (response.error === 'UNAUTHORIZED') {
          setError('Please log in to view your active duels');
        } else {
          setError(response.message || 'Failed to load active duels');
        }
      }
    } catch (err) {
      console.error('Error loading active duels:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderDuelCard = ({ item }) => {
    const isLive = item.status === 'active';
    const isWinning = item.user1Progress > item.user2Progress;
    const opponent = item.user2?.username || 'Unknown User';
    const yourSteps = item.user1Progress || 0;
    const opponentSteps = item.user2Progress || 0;

    // Calculate time remaining
    const timeLeft = item.endTime
      ? new Date(item.endTime).getTime() - new Date().getTime()
      : 0;

    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
    const minutesLeft = Math.max(
      0,
      Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    );
    const timeDisplay =
      timeLeft > 0
        ? `${hoursLeft}h ${minutesLeft}m`
        : item.status === 'pending'
          ? 'Starting soon'
          : 'Ended';

    return (
      <TouchableOpacity
        style={[styles.duelCard, isLive && isWinning && styles.winningCard]}
        onPress={() => {
          if (item.status === 'active') {
            router.push({
              pathname: '/duel-health-monitor',
              params: { duelId: item._id },
            });
          } else {
            router.push({
              pathname: '/duel-details',
              params: { duelId: item._id },
            });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>vs. {opponent}</Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'active'
                  ? styles.liveStatus
                  : styles.waitingStatus,
              ]}
            >
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'Live' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.stake}>{item.stakeAmount} FITFI</Text>
        </View>

        {isLive ? (
          <View style={styles.liveStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Steps</Text>
                <Text
                  style={[styles.statValue, isWinning && styles.winningValue]}
                >
                  {yourSteps.toLocaleString()}
                </Text>
              </View>
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Opponent</Text>
                <Text
                  style={[styles.statValue, !isWinning && styles.winningValue]}
                >
                  {opponentSteps.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min((yourSteps / Math.max(yourSteps, opponentSteps)) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.leadText}>
                {isWinning
                  ? `+${yourSteps - opponentSteps} ahead`
                  : `${opponentSteps - yourSteps} behind`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.waitingInfo}>
            <Text style={styles.waitingText}>Duel starting soon...</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.timeLeft}>⏰ {timeDisplay}</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size='large' color='#667eea' />
        <Text style={styles.loadingText}>Loading active duels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadActiveDuels}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (duels.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>⚔️ Active Duels</Text>
          <Text style={styles.subtitle}>
            Compete with others and earn FITFI tokens
          </Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>🎯 No active duels</Text>
          <Text style={styles.emptySubtext}>
            Start a new duel to compete with other users!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/challenges')}
          >
            <Text style={styles.primaryButtonText}>Browse Challenges</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Active Duels</Text>
        <Text style={styles.subtitle}>
          Compete with others and earn FITFI tokens
        </Text>
      </View>

      <FlatList
        data={duels}
        keyExtractor={(item) => item.id}
        renderItem={renderDuelCard}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  duelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  winningCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveStatus: {
    backgroundColor: '#fef3c7',
  },
  waitingStatus: {
    backgroundColor: '#e0e7ff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  stake: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  liveStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  winningValue: {
    color: '#10b981',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  leadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  waitingInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLeft: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  duelCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  winningCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveStatus: {
    backgroundColor: '#451a03',
  },
  waitingStatus: {
    backgroundColor: '#1e1b4b',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  stake: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  liveStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  winningValue: {
    color: '#10b981',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  leadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  waitingInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLeft: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cbd5e1',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
