import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeStyles } from '../contexts/ThemeContext';
import { apiService, Duel } from '../utils/ApiService';

export default function DuelDetailsScreen() {
  const { duelId, previous } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme-aware styles
  const styles = useThemeStyles(lightStyles, darkStyles);

  useEffect(() => {
    const loadDuelData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getDuel(duelId as string);

        if (response.success && response.data) {
          setDuel(response.data);
        } else {
          setError(response.message || 'Failed to load duel data');
        }
      } catch (err) {
        console.error('Error loading duel:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (duelId && typeof duelId === 'string') {
      loadDuelData();
    } else {
      setError('No duel ID provided');
      setLoading(false);
    }
  }, [duelId, previous]);

  const retryLoadDuel = async () => {
    if (duelId && typeof duelId === 'string') {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getDuel(duelId as string);

        if (response.success && response.data) {
          setDuel(response.data);
        } else {
          setError(response.message || 'Failed to load duel data');
        }
      } catch (err) {
        console.error('Error loading duel:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    }
  };
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color='#667eea' />
        <Text style={styles.loadingText}>Loading duel details...</Text>
      </View>
    );
  }

  if (error && !duel) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryLoadDuel}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!duel) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Duel not found</Text>
      </View>
    );
  }

  // Calculate duel statistics
  const isCompleted = duel.status === 'completed';
  const isWinning = (duel.user1Progress || 0) > (duel.user2Progress || 0);
  const stepDifference = Math.abs(
    (duel.user1Progress || 0) - (duel.user2Progress || 0)
  );
  const targetSteps = 15000; // This should come from challenge data

  // Transform duel data for display
  const duelData = {
    opponent: duel.user2.username,
    startTime: duel.startTime
      ? new Date(duel.startTime).toLocaleString()
      : 'Not started',
    endTime: duel.endTime ? new Date(duel.endTime).toLocaleString() : null,
    duration: `${Math.floor(duel.duration / 60)}h`,
    stake: `${duel.stakeAmount} FITFI`,
    status: isCompleted ? 'Completed' : 'Live',
    timeLeft: isCompleted ? null : '4h 23m', // Calculate this from actual end time
    player1: {
      name: duel.user1.username,
      avatar: '👤',
      currentSteps: duel.user1Progress || 0,
      targetSteps: targetSteps,
      caloriesBurned: Math.floor((duel.user1Progress || 0) * 0.047), // Rough calculation
      distance: parseFloat(((duel.user1Progress || 0) * 0.0008).toFixed(1)), // Rough calculation
      activeMinutes: Math.floor((duel.user1Progress || 0) * 0.009), // Rough calculation
    },
    player2: {
      name: duel.user2.username,
      avatar: '👩',
      currentSteps: duel.user2Progress || 0,
      targetSteps: targetSteps,
      caloriesBurned: Math.floor((duel.user2Progress || 0) * 0.047), // Rough calculation
      distance: parseFloat(((duel.user2Progress || 0) * 0.0008).toFixed(1)), // Rough calculation
      activeMinutes: Math.floor((duel.user2Progress || 0) * 0.009), // Rough calculation
    },
    winner:
      duel.winner === duel.user1._id
        ? 'You'
        : duel.winner === duel.user2._id
          ? duel.user2.username
          : null,
  };

  const PlayerCard = ({ player, isYou, isWinner }) => (
    <View style={[styles.playerCard, isWinner && styles.winnerCard]}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerAvatar}>{player.avatar}</Text>
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isWinner && styles.winnerText]}>
            {player.name}
          </Text>
          {isWinner && <Text style={styles.winnerBadge}>🏆 Winner</Text>}
        </View>
      </View>

      <View style={styles.mainStat}>
        <Text style={[styles.stepCount, isWinner && styles.winnerSteps]}>
          {player.currentSteps.toLocaleString()}
        </Text>
        <Text style={styles.stepLabel}>Steps</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((player.currentSteps / player.targetSteps) * 100, 100)}%`,
                },
                isWinner && styles.winnerProgress,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.min(
              Math.round((player.currentSteps / player.targetSteps) * 100),
              100
            )}
            % of goal
          </Text>
        </View>
      </View>

      <View style={styles.additionalStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.caloriesBurned}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.distance}km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.activeMinutes}m</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Duel vs. {duelData.opponent}</Text>
        <View
          style={[
            styles.statusBadge,
            previous ? styles.completedBadge : styles.liveBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {previous ? '✅ Completed' : '🔴 Live'}
          </Text>
        </View>
      </View>

      {/* Duel Info */}
      <View style={styles.duelInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏱️ Duration</Text>
          <Text style={styles.infoValue}>{duelData.duration}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>💰 Stake</Text>
          <Text style={styles.infoValue}>{duelData.stake}</Text>
        </View>
        {!previous && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏰ Time Left</Text>
            <Text style={[styles.infoValue, styles.timeLeft]}>
              {duelData.timeLeft}
            </Text>
          </View>
        )}
      </View>

      {/* Current Status */}
      {!previous && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {isWinning ? "🎯 You're Leading!" : '⚡ Catch Up!'}
          </Text>
          <Text style={styles.statusDetail}>
            {isWinning
              ? `You're ahead by ${stepDifference.toLocaleString()} steps`
              : `You're behind by ${stepDifference.toLocaleString()} steps`}
          </Text>
        </View>
      )}

      {/* Player Cards */}
      <View style={styles.playersContainer}>
        <PlayerCard
          player={duelData.player1}
          isYou={true}
          isWinner={previous && duelData.winner === 'You'}
        />
        <PlayerCard
          player={duelData.player2}
          isYou={false}
          isWinner={previous && duelData.winner !== 'You'}
        />
      </View>

      {/* Final Result */}
      {previous && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            {duelData.winner === 'You'
              ? '🎉 Congratulations!'
              : '💪 Better Luck Next Time!'}
          </Text>
          <Text style={styles.resultDetail}>
            {duelData.winner === 'You'
              ? `You won this duel and earned ${duelData.stake}!`
              : `You lost this duel. Keep training for the next one!`}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {!previous && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>📱 Share Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.motivateButton}>
            <Text style={styles.motivateButtonText}>⚡ Send Motivation</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
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
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveBadge: {
    backgroundColor: '#fef3c7',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  duelInfo: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  timeLeft: {
    color: '#f59e0b',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  playersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  playerCard: {
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
  winnerCard: {
    borderWidth: 3,
    borderColor: '#10b981',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  winnerText: {
    color: '#10b981',
  },
  winnerBadge: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  winnerSteps: {
    color: '#10b981',
  },
  stepLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  winnerProgress: {
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDetail: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  motivateButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  motivateButtonText: {
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
  centered: {
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
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveBadge: {
    backgroundColor: '#78350f',
  },
  completedBadge: {
    backgroundColor: '#065f46',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  duelInfo: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  timeLeft: {
    color: '#f59e0b',
  },
  statusCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  playersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  playerCard: {
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
  winnerCard: {
    borderWidth: 3,
    borderColor: '#10b981',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  winnerText: {
    color: '#10b981',
  },
  winnerBadge: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  winnerSteps: {
    color: '#10b981',
  },
  stepLabel: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  winnerProgress: {
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDetail: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  motivateButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  motivateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
