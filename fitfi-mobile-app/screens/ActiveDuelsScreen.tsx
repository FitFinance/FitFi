import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';

const duels = [
  {
    id: '1',
    opponent: 'Alice Johnson',
    status: 'Live',
    yourSteps: 8247,
    opponentSteps: 7832,
    timeLeft: '2h 15m',
    stake: '25 FITFI',
  },
  {
    id: '2',
    opponent: 'Bob Smith',
    status: 'Live',
    yourSteps: 6543,
    opponentSteps: 7012,
    timeLeft: '5h 42m',
    stake: '50 FITFI',
  },
  {
    id: '3',
    opponent: 'Sarah Wilson',
    status: 'Waiting',
    yourSteps: 0,
    opponentSteps: 0,
    timeLeft: 'Starts in 30m',
    stake: '10 FITFI',
  },
];

export default function ActiveDuelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  const renderDuelCard = ({ item }) => {
    const isLive = item.status === 'Live';
    const isWinning = item.yourSteps > item.opponentSteps;

    return (
      <TouchableOpacity
        style={[styles.duelCard, isLive && isWinning && styles.winningCard]}
        onPress={() =>
          router.push({
            pathname: '/duel-details',
            params: { duelId: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>vs. {item.opponent}</Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'Live'
                  ? styles.liveStatus
                  : styles.waitingStatus,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.stake}>{item.stake}</Text>
        </View>

        {isLive ? (
          <View style={styles.liveStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Steps</Text>
                <Text
                  style={[styles.statValue, isWinning && styles.winningValue]}
                >
                  {item.yourSteps.toLocaleString()}
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
                  {item.opponentSteps.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min((item.yourSteps / Math.max(item.yourSteps, item.opponentSteps)) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.leadText}>
                {isWinning
                  ? `+${item.yourSteps - item.opponentSteps} ahead`
                  : `${item.opponentSteps - item.yourSteps} behind`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.waitingInfo}>
            <Text style={styles.waitingText}>Duel starting soon...</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.timeLeft}>⏰ {item.timeLeft}</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
});
