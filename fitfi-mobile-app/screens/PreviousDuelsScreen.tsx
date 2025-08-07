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

export default function PreviousDuelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreviousDuels();
  }, []);

  const loadPreviousDuels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize authentication before making API calls
      await apiService.initializeAuth();

      const response = await apiService.getDuels();

      if (response.success && response.data) {
        // Filter only completed duels
        const completedDuels = response.data.filter(
          (duel) => duel.status === 'completed'
        );
        setDuels(completedDuels);
      } else {
        if (response.error === 'UNAUTHORIZED') {
          setError('Please log in to view your duel history');
        } else {
          setError(response.message || 'Failed to load previous duels');
        }
      }
    } catch (err) {
      console.error('Error loading previous duels:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderDuelCard = ({ item }) => {
    const isWinner = item.winner === item.user1?._id;
    const opponent = item.user2?.username || 'Unknown User';
    const yourSteps = item.user1Progress || 0;
    const opponentSteps = item.user2Progress || 0;

    // Calculate reward (this would come from backend ideally)
    const stakeDifference = isWinner ? item.stakeAmount : -item.stakeAmount;
    const reward = `${stakeDifference >= 0 ? '+' : ''}${stakeDifference} FITFI`;
    const isPositiveReward = stakeDifference >= 0;

    // Calculate date
    const endDate = new Date(item.endTime);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dateDisplay =
      daysDiff === 0
        ? 'Today'
        : daysDiff === 1
          ? '1 day ago'
          : daysDiff < 7
            ? `${daysDiff} days ago`
            : daysDiff < 14
              ? '1 week ago'
              : `${Math.floor(daysDiff / 7)} weeks ago`;

    // Calculate duration
    const startDate = new Date(item.startTime);
    const durationHours = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    );
    const durationDisplay =
      durationHours < 24
        ? `${durationHours}h`
        : `${Math.floor(durationHours / 24)}d`;

    return (
      <TouchableOpacity
        style={[styles.duelCard, isWinner ? styles.winCard : styles.lossCard]}
        onPress={() =>
          router.push({
            pathname: '/duel-details',
            params: { duelId: item._id, previous: true },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>vs. {opponent}</Text>
            <View
              style={[
                styles.resultBadge,
                isWinner ? styles.winBadge : styles.lossBadge,
              ]}
            >
              <Text style={styles.resultText}>
                {isWinner ? '🏆 Victory' : '💔 Defeat'}
              </Text>
            </View>
          </View>
          <View style={styles.rewardContainer}>
            <Text
              style={[
                styles.reward,
                isPositiveReward
                  ? styles.positiveReward
                  : styles.negativeReward,
              ]}
            >
              {reward}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Your Steps</Text>
              <Text style={[styles.statValue, isWinner && styles.winnerValue]}>
                {yourSteps.toLocaleString()}
              </Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Opponent</Text>
              <Text style={[styles.statValue, !isWinner && styles.winnerValue]}>
                {opponentSteps.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.difference}>
            <Text style={styles.differenceText}>
              {isWinner
                ? `Won by ${(yourSteps - opponentSteps).toLocaleString()} steps`
                : `Lost by ${(opponentSteps - yourSteps).toLocaleString()} steps`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {dateDisplay}</Text>
          <Text style={styles.durationText}>⏱️ {durationDisplay} duel</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const wins = duels.filter((duel) => duel.winner === duel.user1?._id).length;
  const totalReward = duels.reduce((sum, duel) => {
    const isWinner = duel.winner === duel.user1?._id;
    const stakeDifference = isWinner ? duel.stakeAmount : -duel.stakeAmount;
    return sum + stakeDifference;
  }, 0);

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
        <Text style={styles.loadingText}>Loading duel history...</Text>
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPreviousDuels}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (duels.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📜 Duel History</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>📜 No completed duels</Text>
          <Text style={styles.emptySubtext}>
            Complete some duels to see your history here!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/challenges')}
          >
            <Text style={styles.primaryButtonText}>Start First Duel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>📜 Duel History</Text>
        <View style={styles.statsRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>
              {wins}/{duels.length}
            </Text>
            <Text style={styles.headerStatLabel}>Win Rate</Text>
          </View>
          <View style={styles.headerStat}>
            <Text
              style={[
                styles.headerStatValue,
                totalReward >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {totalReward >= 0 ? '+' : ''}
              {totalReward} FITFI
            </Text>
            <Text style={styles.headerStatLabel}>Total Earned</Text>
          </View>
        </View>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  headerStat: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
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
  winCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  lossCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
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
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  winBadge: {
    backgroundColor: '#dcfce7',
  },
  lossBadge: {
    backgroundColor: '#fecaca',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  reward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveReward: {
    color: '#10b981',
  },
  negativeReward: {
    color: '#ef4444',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  winnerValue: {
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
  difference: {
    alignItems: 'center',
  },
  differenceText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  durationText: {
    fontSize: 12,
    color: '#9ca3af',
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  headerStat: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
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
  },
  winCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  lossCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
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
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  winBadge: {
    backgroundColor: '#065f46',
  },
  lossBadge: {
    backgroundColor: '#7f1d1d',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  reward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveReward: {
    color: '#10b981',
  },
  negativeReward: {
    color: '#ef4444',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  winnerValue: {
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
  difference: {
    alignItems: 'center',
  },
  differenceText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  durationText: {
    fontSize: 12,
    color: '#94a3b8',
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
