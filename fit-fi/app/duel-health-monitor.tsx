import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function DuelHealthMonitorScreen() {
  const router = useRouter();
  const { duelId } = useLocalSearchParams();

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [countdown, setCountdown] = useState(3600); // 60 minutes in seconds
  const [mySteps, setMySteps] = useState(8420);
  const [opponentSteps, setOpponentSteps] = useState(7890);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock duel data
  const duel = {
    id: duelId,
    opponent: 'Sarah Runner',
    challengeType: '24h Step Challenge',
    stake: 100,
    duration: '24 hours',
    startTime: '2024-01-15 08:00',
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMonitoring && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);

        // Simulate step updates
        if (Math.random() > 0.7) {
          setMySteps((prev) => prev + Math.floor(Math.random() * 50));
          setLastUpdate(new Date());
        }
        if (Math.random() > 0.8) {
          setOpponentSteps((prev) => prev + Math.floor(Math.random() * 40));
        }
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [isMonitoring, countdown]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepDifference = () => {
    const diff = Math.abs(mySteps - opponentSteps);
    const isLeading = mySteps > opponentSteps;
    return { diff, isLeading };
  };

  const handleStartChallenge = () => {
    Alert.alert(
      'Start 60-Minute Challenge',
      'This will begin real-time monitoring of your steps for the next 60 minutes. Make sure you have your fitness tracker connected!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Challenge',
          onPress: () => {
            setIsMonitoring(true);
            setCountdown(3600); // Reset to 60 minutes
          },
        },
      ]
    );
  };

  const handlePauseChallenge = () => {
    setIsMonitoring(false);
  };

  const handleResumeChallenge = () => {
    setIsMonitoring(true);
  };

  const handleEndChallenge = () => {
    Alert.alert(
      'End Challenge Early',
      'Are you sure you want to end the challenge? This cannot be undone.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'End Challenge',
          style: 'destructive',
          onPress: () => {
            setIsMonitoring(false);
            Alert.alert(
              'Challenge Completed',
              'Challenge ended successfully!',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const handleSubmitProgress = () => {
    Alert.alert(
      'Progress Submitted',
      'Your current progress has been submitted to the blockchain.'
    );
  };

  const stepDiff = getStepDifference();

  useEffect(() => {
    if (countdown === 0 && isMonitoring) {
      setIsMonitoring(false);
      Alert.alert(
        'Challenge Complete!',
        'The 60-minute challenge has ended. Great work!',
        [{ text: 'View Results', onPress: () => router.back() }]
      );
    }
  }, [countdown, isMonitoring, router]);

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={GlobalStyles.title}>Live Monitor</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Challenge Info */}
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{duel.challengeType}</Text>
          <Text style={styles.opponent}>vs {duel.opponent}</Text>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isMonitoring
                  ? Colors.dark.success
                  : Colors.dark.warning,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {isMonitoring ? '🟢 LIVE' : '⏸️ PAUSED'}
            </Text>
          </View>
        </View>

        {/* Countdown Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text
            style={[
              styles.timerValue,
              {
                color:
                  countdown < 300 ? Colors.dark.error : Colors.dark.primary,
              },
            ]}
          >
            {formatTime(countdown)}
          </Text>
          <Text style={styles.timerSubtext}>
            {countdown < 300 ? 'Less than 5 minutes left!' : 'Keep moving!'}
          </Text>
        </View>

        {/* Real-time Steps Comparison */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Real-time Progress</Text>

          <View style={styles.stepsDisplay}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>You</Text>
              <Text
                style={[
                  styles.stepsNumber,
                  {
                    color: stepDiff.isLeading
                      ? Colors.dark.success
                      : Colors.dark.text,
                  },
                ]}
              >
                {mySteps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>steps</Text>
              {stepDiff.isLeading && (
                <Text style={styles.leadingBadge}>🏆 Leading</Text>
              )}
            </View>

            <View style={styles.vsSection}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.differenceText}>
                {stepDiff.isLeading ? '+' : '-'}
                {stepDiff.diff}
              </Text>
            </View>

            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>{duel.opponent}</Text>
              <Text
                style={[
                  styles.stepsNumber,
                  {
                    color: !stepDiff.isLeading
                      ? Colors.dark.error
                      : Colors.dark.text,
                  },
                ]}
              >
                {opponentSteps.toLocaleString()}
              </Text>
              <Text style={styles.stepsLabel}>steps</Text>
              {!stepDiff.isLeading && (
                <Text style={styles.trailingBadge}>⚡ Behind</Text>
              )}
            </View>
          </View>

          <View style={styles.updateInfo}>
            <Text style={styles.lastUpdateText}>
              Last update: {lastUpdate.toLocaleTimeString()}
            </Text>
            <Text style={styles.syncStatus}>
              {isMonitoring ? '🔄 Auto-syncing...' : '⏸️ Paused'}
            </Text>
          </View>
        </View>

        {/* Health Connect Integration */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>Health Data</Text>
          <View style={styles.healthStats}>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatIcon}>🔥</Text>
              <Text style={styles.healthStatValue}>245</Text>
              <Text style={styles.healthStatLabel}>Calories</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatIcon}>📏</Text>
              <Text style={styles.healthStatValue}>3.2</Text>
              <Text style={styles.healthStatLabel}>km</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatIcon}>⏱️</Text>
              <Text style={styles.healthStatValue}>42</Text>
              <Text style={styles.healthStatLabel}>Active min</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatIcon}>💓</Text>
              <Text style={styles.healthStatValue}>78</Text>
              <Text style={styles.healthStatLabel}>Avg BPM</Text>
            </View>
          </View>
        </View>

        {/* Challenge Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Challenge Progress</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Current Standing</Text>
            <Text
              style={[
                styles.progressStatus,
                {
                  color: stepDiff.isLeading
                    ? Colors.dark.success
                    : Colors.dark.error,
                },
              ]}
            >
              {stepDiff.isLeading ? '🟢 You are winning!' : '🔴 You are behind'}
            </Text>
            <Text style={styles.progressDetails}>
              {stepDiff.isLeading
                ? `You lead by ${stepDiff.diff} steps`
                : `You need ${stepDiff.diff} more steps to take the lead`}
            </Text>

            <View style={styles.motivationSection}>
              <Text style={styles.motivationText}>
                {stepDiff.isLeading
                  ? 'Great job! Keep up the pace! 💪'
                  : 'You can do this! Pick up the pace! 🏃‍♂️'}
              </Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlSection}>
          {!isMonitoring && countdown === 3600 ? (
            <TouchableOpacity
              style={[GlobalStyles.button, styles.startButton]}
              onPress={handleStartChallenge}
            >
              <Text style={GlobalStyles.buttonTextPrimary}>
                Start 60-Min Challenge
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlButtons}>
              {!isMonitoring && countdown > 0 && (
                <TouchableOpacity
                  style={[GlobalStyles.button, styles.resumeButton]}
                  onPress={handleResumeChallenge}
                >
                  <Text style={GlobalStyles.buttonTextPrimary}>
                    Resume Monitoring
                  </Text>
                </TouchableOpacity>
              )}

              {isMonitoring && (
                <TouchableOpacity
                  style={[GlobalStyles.buttonSecondary, styles.pauseButton]}
                  onPress={handlePauseChallenge}
                >
                  <Text style={GlobalStyles.buttonText}>Pause Monitoring</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[GlobalStyles.buttonSecondary, styles.submitButton]}
                onPress={handleSubmitProgress}
              >
                <Text style={GlobalStyles.buttonText}>Submit Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[GlobalStyles.button, styles.endButton]}
                onPress={handleEndChallenge}
              >
                <Text
                  style={[
                    GlobalStyles.buttonTextPrimary,
                    { color: Colors.dark.error },
                  ]}
                >
                  End Challenge
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>📱 How it works</Text>
          <Text style={styles.instructionsText}>
            • Your steps are automatically tracked via Health Connect{'\n'}•
            Progress updates every minute during active monitoring{'\n'}• Submit
            progress periodically to secure your position{'\n'}• Challenge ends
            when timer reaches zero or you end it manually
          </Text>
        </View>
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
  challengeHeader: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  opponent: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  timerSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  stepsSection: {
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
  stepsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerSection: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  stepsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepsLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 8,
  },
  leadingBadge: {
    fontSize: 12,
    color: Colors.dark.success,
    fontWeight: '600',
  },
  trailingBadge: {
    fontSize: 12,
    color: Colors.dark.error,
    fontWeight: '600',
  },
  vsSection: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  differenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  updateInfo: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  lastUpdateText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  syncStatus: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  healthSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthStat: {
    alignItems: 'center',
    flex: 1,
  },
  healthStatIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  healthStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  healthStatLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  progressSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressCard: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  progressStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressDetails: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  motivationSection: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  motivationText: {
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controlSection: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: Colors.dark.success,
  },
  controlButtons: {
    gap: 12,
  },
  resumeButton: {
    backgroundColor: Colors.dark.success,
  },
  pauseButton: {
    borderColor: Colors.dark.warning,
  },
  submitButton: {
    borderColor: Colors.dark.accent,
  },
  endButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  instructionsSection: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
};
