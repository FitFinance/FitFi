import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function DuelDetailsScreen() {
  const router = useRouter();
  const { duelId, previous } = useLocalSearchParams();

  // Mock duel data based on ID
  const getDuelData = (id: string) => {
    const duels = {
      '1': {
        id: '1',
        opponent: 'Sarah Runner',
        status: previous ? 'completed' : 'active',
        outcome: previous ? 'won' : null,
        stake: 100,
        mySteps: previous ? 12450 : 8420,
        theirSteps: previous ? 11200 : 7890,
        reward: previous ? 200 : 0,
        challengeType: '24h Step Challenge',
        duration: '24 hours',
        timeLeft: previous ? 'Completed 2 hours ago' : '4h 23m',
        startTime: '2024-01-15 08:00',
        endTime: previous ? '2024-01-16 08:00' : '2024-01-16 08:00',
        description: 'Who can walk more steps in 24 hours?',
        rules: ['Track steps automatically', 'No manual logging', 'Winner takes all'],
      },
      '2': {
        id: '2',
        opponent: 'Mike Walker',
        status: previous ? 'completed' : 'active',
        outcome: previous ? 'lost' : null,
        stake: 50,
        mySteps: previous ? 8900 : 6230,
        theirSteps: previous ? 10350 : 8100,
        reward: previous ? 0 : 0,
        challengeType: 'Morning Sprint',
        duration: '12 hours',
        timeLeft: previous ? 'Completed 1 day ago' : '12h 15m',
        startTime: '2024-01-14 06:00',
        endTime: previous ? '2024-01-14 18:00' : '2024-01-15 18:00',
        description: 'Early bird gets the worm - morning fitness challenge',
        rules: ['6 AM to 6 PM only', 'Steps tracked automatically', 'Bonus for early start'],
      },
    };
    return duels[id as keyof typeof duels] || duels['1'];
  };

  const duel = getDuelData(duelId as string);

  const getStatusColor = (status: string, outcome?: string | null) => {
    if (status === 'completed') {
      switch (outcome) {
        case 'won': return Colors.dark.success;
        case 'lost': return Colors.dark.error;
        case 'tied': return Colors.dark.warning;
        default: return Colors.dark.textMuted;
      }
    }
    switch (status) {
      case 'active': return Colors.dark.success;
      case 'pending': return Colors.dark.warning;
      default: return Colors.dark.textMuted;
    }
  };

  const getStatusText = (status: string, outcome?: string | null) => {
    if (status === 'completed') {
      switch (outcome) {
        case 'won': return 'WON 🏆';
        case 'lost': return 'LOST 😞';
        case 'tied': return 'TIED 🤝';
        default: return 'COMPLETED';
      }
    }
    return status.toUpperCase();
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing functionality will be implemented soon!');
  };

  const handleMotivate = () => {
    Alert.alert('Motivate', 'Sent a motivational message to your opponent!');
  };

  const handleViewOpponentProfile = () => {
    Alert.alert('View Profile', 'Opponent profile viewing will be implemented soon!');
  };

  const calculateStepDifference = () => {
    const diff = Math.abs(duel.mySteps - duel.theirSteps);
    const leader = duel.mySteps > duel.theirSteps ? 'You' : duel.opponent;
    const isWinning = duel.mySteps > duel.theirSteps;
    
    if (duel.mySteps === duel.theirSteps) {
      return { text: "It's a perfect tie!", color: Colors.dark.warning, isWinning: false };
    }
    
    return {
      text: `${leader} ${isWinning ? 'lead' : 'leads'} by ${diff.toLocaleString()} steps`,
      color: isWinning ? Colors.dark.success : Colors.dark.error,
      isWinning
    };
  };

  const stepDiff = calculateStepDifference();

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={GlobalStyles.title}>Duel Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Duel Header */}
        <View style={styles.duelHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeType}>{duel.challengeType}</Text>
            <Text style={styles.description}>{duel.description}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(duel.status, duel.outcome) }]}>
            <Text style={styles.statusText}>{getStatusText(duel.status, duel.outcome)}</Text>
          </View>
        </View>

        {/* Opponent Info */}
        <TouchableOpacity
          style={styles.opponentSection}
          onPress={handleViewOpponentProfile}
        >
          <View style={styles.opponentInfo}>
            <View style={styles.opponentAvatar}>
              <Text style={styles.opponentAvatarText}>
                {duel.opponent.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.opponentDetails}>
              <Text style={styles.opponentName}>{duel.opponent}</Text>
              <Text style={styles.opponentLabel}>Your opponent</Text>
            </View>
          </View>
          <Text style={styles.viewProfileText}>View Profile →</Text>
        </TouchableOpacity>

        {/* Challenge Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stake</Text>
              <Text style={styles.detailValue}>{duel.stake} FF</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duel.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Started</Text>
              <Text style={styles.detailValue}>{duel.startTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {duel.status === 'completed' ? 'Ended' : 'Ends'}
              </Text>
              <Text style={styles.detailValue}>{duel.endTime}</Text>
            </View>
          </View>
        </View>

        {/* Current Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>
            {duel.status === 'completed' ? 'Final Results' : 'Current Progress'}
          </Text>
          
          <View style={styles.stepsComparison}>
            <View style={styles.playerSide}>
              <Text style={styles.playerLabel}>You</Text>
              <Text style={[
                styles.stepsNumber,
                { color: duel.mySteps >= duel.theirSteps ? Colors.dark.success : Colors.dark.text }
              ]}>
                {duel.mySteps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>steps</Text>
            </View>
            
            <View style={styles.vsSection}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={[styles.differenceText, { color: stepDiff.color }]}>
                {stepDiff.text}
              </Text>
            </View>
            
            <View style={styles.playerSide}>
              <Text style={styles.playerLabel}>Opponent</Text>
              <Text style={[
                styles.stepsNumber,
                { color: duel.theirSteps > duel.mySteps ? Colors.dark.error : Colors.dark.text }
              ]}>
                {duel.theirSteps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>steps</Text>
            </View>
          </View>

          <View style={styles.timeRemaining}>
            <Text style={styles.timeLabel}>
              {duel.status === 'completed' ? 'Completed' : 'Time Remaining'}
            </Text>
            <Text style={[
              styles.timeValue,
              { color: duel.status === 'completed' ? Colors.dark.textSecondary : Colors.dark.warning }
            ]}>
              {duel.timeLeft}
            </Text>
          </View>
        </View>

        {/* Rules */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {duel.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>{index + 1}.</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* Reward/Result Section */}
        {duel.status === 'completed' ? (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Final Result</Text>
            <View style={[
              styles.resultCard,
              { backgroundColor: getStatusColor(duel.status, duel.outcome) }
            ]}>
              <Text style={styles.resultTitle}>
                {duel.outcome === 'won' ? 'Congratulations! 🎉' : 
                 duel.outcome === 'lost' ? 'Better luck next time!' : 
                 'Great effort! 🤝'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {duel.outcome === 'won' ? `You earned ${duel.reward} FF` :
                 duel.outcome === 'lost' ? `You lost ${duel.stake} FF` :
                 `Your ${duel.stake} FF stake was returned`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.rewardSection}>
            <Text style={styles.sectionTitle}>Potential Reward</Text>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardAmount}>
                Winner gets: {duel.stake * 2} FF
              </Text>
              <Text style={styles.rewardDescription}>
                Winner takes both stakes (your {duel.stake} FF + opponent&apos;s {duel.stake} FF)
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {duel.status === 'active' && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[GlobalStyles.button, styles.monitorButton]}
              onPress={() => router.push(`/duel-health-monitor?duelId=${duel.id}`)}
            >
              <Text style={GlobalStyles.buttonTextPrimary}>Monitor Live Progress</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.actionButton]}
                onPress={handleShare}
              >
                <Text style={GlobalStyles.buttonText}>Share 📤</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.actionButton]}
                onPress={handleMotivate}
              >
                <Text style={GlobalStyles.buttonText}>Motivate 💪</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    padding: 16,
  },
  duelHeader: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeInfo: {
    flex: 1,
    marginRight: 16,
  },
  challengeType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  opponentSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  opponentAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  opponentDetails: {
    flex: 1,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  opponentLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  viewProfileText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  progressSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  stepsComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerSide: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  stepsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepsLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  vsSection: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.textMuted,
    marginBottom: 8,
  },
  differenceText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  timeRemaining: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rulesSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ruleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginRight: 8,
    minWidth: 20,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  resultSection: {
    marginBottom: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rewardSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rewardCard: {
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 20,
  },
  monitorButton: {
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
};
