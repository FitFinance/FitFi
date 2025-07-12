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

const duels = [
  {
    id: '1',
    opponent: 'Alice Johnson',
    winner: 'You',
    yourSteps: 12847,
    opponentSteps: 11532,
    reward: '+35 FITFI',
    date: '2 days ago',
    duration: '24h',
  },
  {
    id: '2',
    opponent: 'Bob Smith',
    winner: 'Bob Smith',
    yourSteps: 9456,
    opponentSteps: 10892,
    reward: '-20 FITFI',
    date: '5 days ago',
    duration: '24h',
  },
  {
    id: '3',
    opponent: 'Sarah Wilson',
    winner: 'You',
    yourSteps: 15234,
    opponentSteps: 13892,
    reward: '+50 FITFI',
    date: '1 week ago',
    duration: '48h',
  },
  {
    id: '4',
    opponent: 'Mike Davis',
    winner: 'Mike Davis',
    yourSteps: 8763,
    opponentSteps: 9234,
    reward: '-15 FITFI',
    date: '2 weeks ago',
    duration: '24h',
  },
];

export default function PreviousDuelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderDuelCard = ({ item }) => {
    const isWinner = item.winner === 'You';
    const isPositiveReward = item.reward.startsWith('+');

    return (
      <TouchableOpacity
        style={[styles.duelCard, isWinner ? styles.winCard : styles.lossCard]}
        onPress={() =>
          router.push({
            pathname: '/duel-details',
            params: { duelId: item.id, previous: true },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>vs. {item.opponent}</Text>
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
              {item.reward}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Your Steps</Text>
              <Text style={[styles.statValue, isWinner && styles.winnerValue]}>
                {item.yourSteps.toLocaleString()}
              </Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Opponent</Text>
              <Text style={[styles.statValue, !isWinner && styles.winnerValue]}>
                {item.opponentSteps.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.difference}>
            <Text style={styles.differenceText}>
              {isWinner
                ? `Won by ${(item.yourSteps - item.opponentSteps).toLocaleString()} steps`
                : `Lost by ${(item.opponentSteps - item.yourSteps).toLocaleString()} steps`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {item.date}</Text>
          <Text style={styles.durationText}>⏱️ {item.duration} duel</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const wins = duels.filter((duel) => duel.winner === 'You').length;
  const totalReward = duels.reduce((sum, duel) => {
    const value = parseInt(duel.reward.replace(/[^0-9-]/g, ''));
    return sum + value;
  }, 0);

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

const styles = StyleSheet.create({
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
});
