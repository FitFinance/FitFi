import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

interface Duel {
  id: string;
  opponent: string;
  status: 'active' | 'pending' | 'searching' | 'accepted';
  stake: number;
  mySteps: number;
  theirSteps: number;
  timeLeft: string;
  challengeType: string;
  duration: string;
}

export default function ActiveDuelsScreen() {
  const router = useRouter();

  const mockActiveDuels: Duel[] = [
    {
      id: '1',
      opponent: 'Sarah Runner',
      status: 'active',
      stake: 100,
      mySteps: 8420,
      theirSteps: 7890,
      timeLeft: '4h 23m',
      challengeType: '24h Step Challenge',
      duration: '24 hours',
    },
    {
      id: '2',
      opponent: 'Mike Walker',
      status: 'active',
      stake: 50,
      mySteps: 6230,
      theirSteps: 8100,
      timeLeft: '12h 15m',
      challengeType: 'Morning Sprint',
      duration: '12 hours',
    },
    {
      id: '3',
      opponent: 'Lisa Jogger',
      status: 'pending',
      stake: 75,
      mySteps: 0,
      theirSteps: 0,
      timeLeft: '2h 45m',
      challengeType: 'Weekend Challenge',
      duration: '48 hours',
    },
    {
      id: '4',
      opponent: 'Tom Sprint',
      status: 'accepted',
      stake: 200,
      mySteps: 0,
      theirSteps: 0,
      timeLeft: '30m',
      challengeType: 'Elite Challenge',
      duration: '24 hours',
    },
    {
      id: '5',
      opponent: 'Finding opponent...',
      status: 'searching',
      stake: 50,
      mySteps: 0,
      theirSteps: 0,
      timeLeft: '∞',
      challengeType: 'Quick Match',
      duration: '6 hours',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.dark.success;
      case 'pending':
        return Colors.dark.warning;
      case 'searching':
        return Colors.dark.accent;
      case 'accepted':
        return Colors.dark.primary;
      default:
        return Colors.dark.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'pending':
        return 'PENDING';
      case 'searching':
        return 'SEARCHING';
      case 'accepted':
        return 'STARTING SOON';
      default:
        return status.toUpperCase();
    }
  };

  const handleDuelPress = (duel: Duel) => {
    if (duel.status === 'active') {
      router.push(`/duel-health-monitor?duelId=${duel.id}`);
    } else {
      router.push(`/duel-details?duelId=${duel.id}`);
    }
  };

  const renderDuelCard = ({ item: duel }: { item: Duel }) => (
    <TouchableOpacity
      style={[GlobalStyles.card, styles.duelCard]}
      onPress={() => handleDuelPress(duel)}
    >
      <View style={styles.duelHeader}>
        <View>
          <Text style={styles.challengeType}>{duel.challengeType}</Text>
          <Text style={styles.opponent}>vs {duel.opponent}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(duel.status) }]}>
          <Text style={styles.statusText}>{getStatusText(duel.status)}</Text>
        </View>
      </View>

      <View style={styles.duelInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stake:</Text>
          <Text style={styles.infoValue}>{duel.stake} FF</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{duel.duration}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time Left:</Text>
          <Text style={[styles.infoValue, styles.timeLeft]}>{duel.timeLeft}</Text>
        </View>
      </View>

      {duel.status === 'active' && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Current Progress</Text>
          <View style={styles.stepsComparison}>
            <View style={styles.stepsSide}>
              <Text style={styles.stepsLabel}>You</Text>
              <Text style={styles.stepsNumber}>{duel.mySteps.toLocaleString()}</Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.stepsSide}>
              <Text style={styles.stepsLabel}>Them</Text>
              <Text style={styles.stepsNumber}>{duel.theirSteps.toLocaleString()}</Text>
            </View>
          </View>
          
          {duel.mySteps > duel.theirSteps ? (
            <Text style={styles.leadingText}>🟢 You&apos;re leading!</Text>
          ) : duel.mySteps < duel.theirSteps ? (
            <Text style={styles.trailingText}>🔴 You&apos;re behind</Text>
          ) : (
            <Text style={styles.tiedText}>🟡 It&apos;s a tie!</Text>
          )}
        </View>
      )}

      {duel.status === 'searching' && (
        <View style={styles.searchingSection}>
          <Text style={styles.searchingText}>🔍 Looking for an opponent...</Text>
          <Text style={styles.searchingSubtext}>You&apos;ll be notified when someone accepts</Text>
        </View>
      )}

      {duel.status === 'pending' && (
        <View style={styles.pendingSection}>
          <Text style={styles.pendingText}>⏳ Waiting for opponent to confirm</Text>
        </View>
      )}

      {duel.status === 'accepted' && (
        <View style={styles.acceptedSection}>
          <Text style={styles.acceptedText}>✅ Challenge accepted! Starting soon...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={GlobalStyles.emptyState}>
      <Text style={GlobalStyles.emptyStateIcon}>🏃‍♂️</Text>
      <Text style={GlobalStyles.emptyStateTitle}>No Active Duels</Text>
      <Text style={GlobalStyles.emptyStateText}>
        Start your fitness journey by joining a challenge or finding an opponent to duel with!
      </Text>
      <TouchableOpacity
        style={[GlobalStyles.button, styles.emptyActionButton]}
        onPress={() => router.push('/challenges')}
      >
        <Text style={GlobalStyles.buttonTextPrimary}>Browse Challenges</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={GlobalStyles.title}>Active Duels</Text>
        <Text style={styles.subtitle}>
          {mockActiveDuels.length} active {mockActiveDuels.length === 1 ? 'duel' : 'duels'}
        </Text>
      </View>

      {mockActiveDuels.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={mockActiveDuels}
          renderItem={renderDuelCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    marginBottom: 12,
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
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  duelInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  timeLeft: {
    color: Colors.dark.warning,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepsComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    color: Colors.dark.text,
  },
  vsContainer: {
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textMuted,
  },
  leadingText: {
    fontSize: 12,
    color: Colors.dark.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  trailingText: {
    fontSize: 12,
    color: Colors.dark.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  tiedText: {
    fontSize: 12,
    color: Colors.dark.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  searchingSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchingSubtext: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  pendingSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    color: Colors.dark.warning,
    fontWeight: '600',
  },
  acceptedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  acceptedText: {
    fontSize: 14,
    color: Colors.dark.success,
    fontWeight: '600',
  },
  emptyActionButton: {
    marginTop: 20,
    paddingHorizontal: 32,
  },
};
