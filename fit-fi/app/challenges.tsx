import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'custom';
  duration: string;
  stake: number;
  maxParticipants: number;
  currentParticipants: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string[];
  startTime?: string;
  featured?: boolean;
}

export default function ChallengesScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'daily' | 'weekly' | 'custom'>('all');

  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: '10K Daily Steps',
      description: 'Walk 10,000 steps every day for a week',
      type: 'daily',
      duration: '7 days',
      stake: 50,
      maxParticipants: 100,
      currentParticipants: 67,
      reward: 100,
      difficulty: 'easy',
      requirements: ['10,000 steps daily', 'No rest days', 'Auto-tracking only'],
      featured: true,
    },
    {
      id: '2',
      title: 'Weekend Warrior',
      description: 'Complete 20K steps each day during the weekend',
      type: 'weekly',
      duration: '2 days',
      stake: 75,
      maxParticipants: 50,
      currentParticipants: 23,
      reward: 150,
      difficulty: 'medium',
      requirements: ['20,000 steps on Saturday', '20,000 steps on Sunday', 'Weekend only'],
    },
    {
      id: '3',
      title: 'Marathon Month',
      description: 'Walk the equivalent of a marathon distance over 30 days',
      type: 'custom',
      duration: '30 days',
      stake: 200,
      maxParticipants: 25,
      currentParticipants: 8,
      reward: 500,
      difficulty: 'hard',
      requirements: ['42.2 km total', 'Within 30 days', 'Minimum 1km per day'],
      featured: true,
    },
    {
      id: '4',
      title: 'Morning Jogger',
      description: 'Complete 5K steps before 9 AM for 5 consecutive days',
      type: 'daily',
      duration: '5 days',
      stake: 30,
      maxParticipants: 200,
      currentParticipants: 145,
      reward: 60,
      difficulty: 'easy',
      requirements: ['5,000 steps by 9 AM', '5 consecutive days', 'Early bird bonus'],
    },
    {
      id: '5',
      title: 'Step Streak Supreme',
      description: 'Maintain a 15,000+ step streak for 2 weeks',
      type: 'custom',
      duration: '14 days',
      stake: 150,
      maxParticipants: 30,
      currentParticipants: 12,
      reward: 300,
      difficulty: 'hard',
      requirements: ['15,000+ steps daily', 'No missed days', '14 day streak'],
    },
    {
      id: '6',
      title: 'Calorie Crusher',
      description: 'Burn 500+ calories through walking each day',
      type: 'weekly',
      duration: '7 days',
      stake: 100,
      maxParticipants: 75,
      currentParticipants: 34,
      reward: 200,
      difficulty: 'medium',
      requirements: ['500+ calories daily', 'Walking only', 'Health Connect verified'],
    },
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'custom', label: 'Custom' },
  ];

  const filteredChallenges = selectedFilter === 'all' 
    ? mockChallenges 
    : mockChallenges.filter(c => c.type === selectedFilter);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return Colors.dark.success;
      case 'medium': return Colors.dark.warning;
      case 'hard': return Colors.dark.error;
      default: return Colors.dark.textMuted;
    }
  };

  const getDifficultyIcon = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getParticipationRate = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    // For now, just show an alert. In real app, this would integrate with smart contracts
    const participationRate = getParticipationRate(challenge.currentParticipants, challenge.maxParticipants);
    if (participationRate >= 100) {
      alert('This challenge is full! Try another one.');
    } else {
      alert(`Joining "${challenge.title}" challenge! This will be implemented with smart contract integration.`);
    }
  };

  const renderChallengeCard = ({ item: challenge }: { item: Challenge }) => {
    const participationRate = getParticipationRate(challenge.currentParticipants, challenge.maxParticipants);
    const isFull = participationRate >= 100;

    return (
      <View style={[styles.challengeCard, challenge.featured && styles.featuredCard]}>
        {challenge.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ FEATURED</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
          
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyIcon}>{getDifficultyIcon(challenge.difficulty)}</Text>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}>
              {challenge.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.challengeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{challenge.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stake:</Text>
            <Text style={styles.detailValue}>{challenge.stake} FF</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reward:</Text>
            <Text style={[styles.detailValue, styles.rewardText]}>{challenge.reward} FF</Text>
          </View>
        </View>

        <View style={styles.participationSection}>
          <View style={styles.participationInfo}>
            <Text style={styles.participationText}>
              {challenge.currentParticipants}/{challenge.maxParticipants} participants
            </Text>
            <Text style={styles.participationRate}>
              {participationRate}% full
            </Text>
          </View>
          <View style={styles.participationBar}>
            <View style={[
              styles.participationFill,
              { 
                width: `${Math.min(participationRate, 100)}%`,
                backgroundColor: isFull ? Colors.dark.error : Colors.dark.primary
              }
            ]} />
          </View>
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          {challenge.requirements.map((req, index) => (
            <Text key={index} style={styles.requirementItem}>• {req}</Text>
          ))}
        </View>

        <TouchableOpacity
          style={[
            GlobalStyles.button,
            styles.joinButton,
            isFull && styles.joinButtonDisabled
          ]}
          onPress={() => handleJoinChallenge(challenge)}
          disabled={isFull}
        >
          <Text style={[
            GlobalStyles.buttonTextPrimary,
            isFull && styles.joinButtonTextDisabled
          ]}>
            {isFull ? 'Challenge Full' : `Join Challenge (${challenge.stake} FF)`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={GlobalStyles.emptyState}>
      <Text style={GlobalStyles.emptyStateIcon}>🎯</Text>
      <Text style={GlobalStyles.emptyStateTitle}>No Challenges Found</Text>
      <Text style={GlobalStyles.emptyStateText}>
        No challenges match your current filter. Try selecting a different category or check back later for new challenges!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={GlobalStyles.title}>Challenges</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallengeCard}
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
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  featuredCard: {
    borderColor: Colors.dark.primary,
    borderWidth: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  difficultyBadge: {
    alignItems: 'center',
  },
  difficultyIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  challengeDetails: {
    marginBottom: 16,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  rewardText: {
    color: Colors.dark.primary,
  },
  participationSection: {
    marginBottom: 16,
  },
  participationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participationText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  participationRate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  participationBar: {
    height: 4,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  participationFill: {
    height: '100%',
    borderRadius: 2,
  },
  requirementsSection: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
    lineHeight: 16,
  },
  joinButton: {
    marginTop: 8,
  },
  joinButtonDisabled: {
    backgroundColor: Colors.dark.border,
    opacity: 0.6,
  },
  joinButtonTextDisabled: {
    color: Colors.dark.textMuted,
  },
};
