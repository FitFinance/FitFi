import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

interface CompletedDuel {
  id: string;
  opponent: string;
  outcome: 'won' | 'lost' | 'tied';
  mySteps: number;
  theirSteps: number;
  stake: number;
  reward: number;
  challengeType: string;
  completedAt: string;
  duration: string;
}

export default function PreviousDuelsScreen() {
  const router = useRouter();

  const mockCompletedDuels: CompletedDuel[] = [
    {
      id: '1',
      opponent: 'Sarah Runner',
      outcome: 'won',
      mySteps: 12450,
      theirSteps: 11200,
      stake: 100,
      reward: 200,
      challengeType: '24h Step Challenge',
      completedAt: '2 hours ago',
      duration: '24 hours',
    },
    {
      id: '2',
      opponent: 'Mike Walker',
      outcome: 'lost',
      mySteps: 8900,
      theirSteps: 10350,
      stake: 50,
      reward: 0,
      challengeType: 'Morning Sprint',
      completedAt: '1 day ago',
      duration: '12 hours',
    },
    {
      id: '3',
      opponent: 'Lisa Jogger',
      outcome: 'won',
      mySteps: 15670,
      theirSteps: 14200,
      stake: 75,
      reward: 150,
      challengeType: 'Weekend Challenge',
      completedAt: '3 days ago',
      duration: '48 hours',
    },
    {
      id: '4',
      opponent: 'Tom Sprint',
      outcome: 'tied',
      mySteps: 9850,
      theirSteps: 9850,
      stake: 200,
      reward: 200, // Return of stake
      challengeType: 'Elite Challenge',
      completedAt: '5 days ago',
      duration: '24 hours',
    },
    {
      id: '5',
      opponent: 'Anna Fitness',
      outcome: 'won',
      mySteps: 7320,
      theirSteps: 6890,
      stake: 30,
      reward: 60,
      challengeType: 'Quick Match',
      completedAt: '1 week ago',
      duration: '6 hours',
    },
    {
      id: '6',
      opponent: 'Chris Runner',
      outcome: 'lost',
      mySteps: 11200,
      theirSteps: 13450,
      stake: 100,
      reward: 0,
      challengeType: 'Daily Challenge',
      completedAt: '1 week ago',
      duration: '24 hours',
    },
  ];

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return Colors.dark.success;
      case 'lost':
        return Colors.dark.error;
      case 'tied':
        return Colors.dark.warning;
      default:
        return Colors.dark.textMuted;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return '🏆';
      case 'lost':
        return '😞';
      case 'tied':
        return '🤝';
      default:
        return '❓';
    }
  };

  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return 'WON';
      case 'lost':
        return 'LOST';
      case 'tied':
        return 'TIED';
      default:
        return outcome.toUpperCase();
    }
  };

  const handleDuelPress = (duel: CompletedDuel) => {
    router.push(`/duel-details?duelId=${duel.id}&previous=true`);
  };

  const renderDuelCard = ({ item: duel }: { item: CompletedDuel }) => (
    <TouchableOpacity
      style={[GlobalStyles.card, styles.duelCard]}
      onPress={() => handleDuelPress(duel)}
    >
      <View style={styles.duelHeader}>
        <View style={styles.duelInfo}>
          <Text style={styles.challengeType}>{duel.challengeType}</Text>
          <Text style={styles.opponent}>vs {duel.opponent}</Text>
          <Text style={styles.completedAt}>{duel.completedAt}</Text>
        </View>
        <View style={styles.outcomeContainer}>
          <View style={[styles.outcomeBadge, { backgroundColor: getOutcomeColor(duel.outcome) }]}>
            <Text style={styles.outcomeText}>{getOutcomeText(duel.outcome)}</Text>
          </View>
          <Text style={styles.outcomeIcon}>{getOutcomeIcon(duel.outcome)}</Text>
        </View>
      </View>

      <View style={styles.stepsComparison}>
        <View style={styles.stepsSide}>
          <Text style={styles.stepsLabel}>You</Text>
          <Text style={[
            styles.stepsNumber,
            { color: duel.mySteps >= duel.theirSteps ? Colors.dark.success : Colors.dark.text }
          ]}>
            {duel.mySteps.toLocaleString()}
          </Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.stepsSide}>
          <Text style={styles.stepsLabel}>Opponent</Text>
          <Text style={[
            styles.stepsNumber,
            { color: duel.theirSteps > duel.mySteps ? Colors.dark.error : Colors.dark.text }
          ]}>
            {duel.theirSteps.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.rewardSection}>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>Stake:</Text>
          <Text style={styles.stakeValue}>{duel.stake} FF</Text>
        </View>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>
            {duel.outcome === 'won' ? 'Reward:' : duel.outcome === 'tied' ? 'Returned:' : 'Lost:'}
          </Text>
          <Text style={[
            styles.rewardValue,
            {
              color: duel.outcome === 'won' ? Colors.dark.success :
                     duel.outcome === 'tied' ? Colors.dark.warning :
                     Colors.dark.error
            }
          ]}>
            {duel.outcome === 'lost' ? '-' : '+'}{duel.reward} FF
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={GlobalStyles.emptyState}>
      <Text style={GlobalStyles.emptyStateIcon}>📊</Text>
      <Text style={GlobalStyles.emptyStateTitle}>No Completed Duels</Text>
      <Text style={GlobalStyles.emptyStateText}>
        Your completed challenges and duels will appear here. Start your first challenge to build your history!
      </Text>
      <TouchableOpacity
        style={[GlobalStyles.button, styles.emptyActionButton]}
        onPress={() => router.push('/challenges')}
      >
        <Text style={GlobalStyles.buttonTextPrimary}>Find Your First Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  const getTotalStats = () => {
    const totalWins = mockCompletedDuels.filter(d => d.outcome === 'won').length;
    const totalLosses = mockCompletedDuels.filter(d => d.outcome === 'lost').length;
    const totalTies = mockCompletedDuels.filter(d => d.outcome === 'tied').length;
    const totalEarnings = mockCompletedDuels.reduce((sum, d) => {
      return sum + (d.outcome === 'lost' ? -d.stake : d.reward);
    }, 0);

    return { totalWins, totalLosses, totalTies, totalEarnings };
  };

  const stats = getTotalStats();

  const StatsHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalWins}</Text>
        <Text style={styles.statLabel}>Wins</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalLosses}</Text>
        <Text style={styles.statLabel}>Losses</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalTies}</Text>
        <Text style={styles.statLabel}>Ties</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[
          styles.statNumber,
          { color: stats.totalEarnings >= 0 ? Colors.dark.success : Colors.dark.error }
        ]}>
          {stats.totalEarnings >= 0 ? '+' : ''}{stats.totalEarnings}
        </Text>
        <Text style={styles.statLabel}>Net FF</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={GlobalStyles.title}>Previous Duels</Text>
        <Text style={styles.subtitle}>
          {mockCompletedDuels.length} completed {mockCompletedDuels.length === 1 ? 'duel' : 'duels'}
        </Text>
      </View>

      {mockCompletedDuels.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={mockCompletedDuels}
          renderItem={renderDuelCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<StatsHeader />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = {
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  duelCard: {
    marginBottom: 16,
  },
  duelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  duelInfo: {
    flex: 1,
  },
  challengeType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  opponent: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  completedAt: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  outcomeContainer: {
    alignItems: 'center',
  },
  outcomeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outcomeIcon: {
    fontSize: 16,
  },
  stepsComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
  },
  stepsSide: {
    flex: 1,
    alignItems: 'center',
  },
  stepsLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  stepsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vsContainer: {
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textMuted,
  },
  rewardSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  stakeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyActionButton: {
    marginTop: 20,
    paddingHorizontal: 32,
  },
};
