import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../contexts/ThemeContext';
import { healthConnectService } from '../utils/HealthConnectService';
import { fitFiApiService, DuelData } from '../utils/FitFiApiService';

export default function DuelHealthMonitor() {
  const router = useRouter();
  const { duelId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(lightStyles, darkStyles);

  const [duelData, setDuelData] = useState<DuelData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isHealthConnectReady, setIsHealthConnectReady] = useState(false);
  const [lastDataSubmission, setLastDataSubmission] = useState<Date | null>(
    null
  );

  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const initializeHealthConnect = useCallback(async () => {
    try {
      const initialized = await healthConnectService.initialize();
      if (!initialized) {
        Alert.alert(
          'Health Connect Not Available',
          'Health Connect is required for fitness tracking. Please install Google Health Connect app.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      const permissionsGranted =
        await healthConnectService.requestPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'Please grant Health Connect permissions to participate in duels.',
          [
            { text: 'Retry', onPress: initializeHealthConnect },
            { text: 'Cancel', onPress: () => router.back() },
          ]
        );
        return;
      }

      setIsHealthConnectReady(true);
      console.log('✅ Health Connect initialized and ready');
    } catch (error) {
      console.error('❌ Health Connect initialization failed:', error);
      Alert.alert(
        'Setup Error',
        'Failed to initialize health tracking. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [router]);

  const startCountdown = useCallback(
    (endTime: Date) => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }

      countdownInterval.current = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(
          0,
          Math.floor((endTime.getTime() - now.getTime()) / 1000)
        );

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsMonitoring(false);

          if (duelData) {
            healthConnectService.stopDuelMonitoring(duelData.id);
          }

          Alert.alert(
            'Challenge Complete!',
            'Your fitness challenge has ended. Results are being calculated...',
            [{ text: 'View Results', onPress: () => router.back() }]
          );
        }
      }, 1000);
    },
    [duelData, router]
  );

  const finishDuel = useCallback(async () => {
    try {
      setIsMonitoring(false);

      if (duelData) {
        await healthConnectService.stopDuelMonitoring(duelData.id);
      }

      Alert.alert(
        'Challenge Complete!',
        'Your fitness challenge has ended. Results are being calculated...',
        [{ text: 'View Results', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('❌ Error finishing duel:', error);
    }
  }, [duelData, router]);

  const loadDuelData = useCallback(async () => {
    try {
      if (!duelId || Array.isArray(duelId)) {
        throw new Error('Invalid duel ID');
      }

      const data = await fitFiApiService.getDuelDetails(duelId);
      if (!data) {
        throw new Error('Duel not found');
      }

      setDuelData(data);

      // Check if duel is already monitoring
      if (
        data.status === 'monitoring_health' &&
        data.duelStartTime &&
        data.duelEndTime
      ) {
        const now = new Date();
        const endTime = new Date(data.duelEndTime);

        if (now < endTime) {
          setIsMonitoring(true);
          setTimeRemaining(
            Math.floor((endTime.getTime() - now.getTime()) / 1000)
          );
          startCountdown(endTime);
        }
      }

      // Set initial scores if available
      if (data.currentScores) {
        setCurrentScore(data.currentScores.user1Score || 0);
        setOpponentScore(data.currentScores.user2Score || 0);
      }
    } catch (error) {
      console.error('❌ Failed to load duel data:', error);
      Alert.alert(
        'Error',
        'Failed to load duel information. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [duelId, router, startCountdown]);

  const collectAndSubmitHealthData = useCallback(async () => {
    try {
      if (!duelData || !isHealthConnectReady) return;

      const monitoringStatus =
        await healthConnectService.getDuelMonitoringStatus(duelData.id);
      if (!monitoringStatus.isActive || !monitoringStatus.startTime) return;

      // Get the latest cumulative value since duel start
      const latestValue = await healthConnectService.getLatestCumulativeValue(
        duelData.challenge.unit,
        monitoringStatus.startTime
      );

      // Submit to backend
      await fitFiApiService.submitHealthData({
        duelId: duelData.id,
        dataType: duelData.challenge.unit,
        value: latestValue,
        timestamp: new Date().toISOString(),
      });

      // Update local score
      setCurrentScore(latestValue);
      setLastDataSubmission(new Date());

      console.log(`📊 Submitted ${duelData.challenge.unit}: ${latestValue}`);
    } catch (error) {
      console.error('❌ Failed to collect health data:', error);
    }
  }, [duelData, isHealthConnectReady]);

  const startMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }

    // Monitor health data every 30 seconds
    monitoringInterval.current = setInterval(async () => {
      await collectAndSubmitHealthData();
    }, 30000);

    // Initial data collection
    collectAndSubmitHealthData();
  }, [collectAndSubmitHealthData]);

  const setupAppStateListener = useCallback(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App became active - collect data
        if (isMonitoring) {
          collectAndSubmitHealthData();
        }
      }
      appStateRef.current = nextAppState;
    });

    return subscription;
  }, [isMonitoring, collectAndSubmitHealthData]);

  useEffect(() => {
    initializeHealthConnect();
    loadDuelData();
    setupAppStateListener();

    return () => {
      cleanup();
    };
  }, [initializeHealthConnect, loadDuelData, setupAppStateListener]);

  useEffect(() => {
    if (isMonitoring && duelData && isHealthConnectReady) {
      startMonitoring();
    }

    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, [isMonitoring, duelData, isHealthConnectReady, startMonitoring]);

  const startHealthMonitoring = async () => {
    try {
      if (!duelData || !isHealthConnectReady) {
        throw new Error('Not ready to start monitoring');
      }

      Alert.alert(
        'Start Fitness Challenge',
        `Ready to start your ${duelData.challenge.unit} challenge? Target: ${duelData.challenge.target} ${duelData.challenge.unit}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Challenge', onPress: confirmStartMonitoring },
        ]
      );
    } catch (error) {
      console.error('❌ Failed to prepare monitoring:', error);
      Alert.alert(
        'Error',
        'Failed to start health monitoring. Please try again.'
      );
    }
  };

  const confirmStartMonitoring = async () => {
    try {
      if (!duelData) return;

      // Start monitoring on backend
      await fitFiApiService.startHealthMonitoring(duelData.id, 60); // 60 minute duel

      // Start local monitoring
      await healthConnectService.startDuelMonitoring(
        duelData.id,
        duelData.challenge.unit
      );

      setIsMonitoring(true);
      setTimeRemaining(60 * 60); // 60 minutes in seconds

      // Start countdown
      const endTime = new Date(Date.now() + 60 * 60 * 1000);
      startCountdown(endTime);

      Alert.alert(
        'Challenge Started!',
        'Your fitness challenge is now active. Start moving!',
        [{ text: 'Let&apos;s Go!', style: 'default' }]
      );
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      Alert.alert('Error', 'Failed to start the challenge. Please try again.');
    }
  };

  const cleanup = () => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!duelData) return 0;
    return Math.min((currentScore / duelData.challenge.target) * 100, 100);
  };

  const getUnitDisplay = (unit: string): string => {
    switch (unit) {
      case 'steps':
        return 'steps';
      case 'calories':
        return 'cal';
      case 'distance':
        return 'km';
      default:
        return unit;
    }
  };

  if (!duelData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading duel data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Duel</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Challenge Info */}
      <View style={styles.challengeSection}>
        <Text style={styles.challengeTitle}>
          {duelData.challenge.unit.toUpperCase()} Challenge
        </Text>
        <Text style={styles.challengeTarget}>
          Target: {duelData.challenge.target}{' '}
          {getUnitDisplay(duelData.challenge.unit)}
        </Text>

        {isMonitoring && (
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
          </View>
        )}
      </View>

      {/* Scores Section */}
      <View style={styles.scoresSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>
            {currentScore.toLocaleString()}{' '}
            {getUnitDisplay(duelData.challenge.unit)}
          </Text>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {getProgressPercentage().toFixed(1)}% of target
          </Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Opponent</Text>
          <Text style={styles.scoreValue}>
            {opponentScore.toLocaleString()}{' '}
            {getUnitDisplay(duelData.challenge.unit)}
          </Text>
          <View style={styles.leadIndicator}>
            {currentScore > opponentScore ? (
              <Text style={styles.leadingText}>You&apos;re leading! 🔥</Text>
            ) : currentScore < opponentScore ? (
              <Text style={styles.trailingText}>You&apos;re behind 📈</Text>
            ) : (
              <Text style={styles.tiedText}>It&apos;s a tie! ⚡</Text>
            )}
          </View>
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.statusSection}>
        {!isHealthConnectReady ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Setting up Health Connect...</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeHealthConnect}
            >
              <Text style={styles.retryButtonText}>Retry Setup</Text>
            </TouchableOpacity>
          </View>
        ) : !isMonitoring ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Ready to Start</Text>
            <Text style={styles.statusDescription}>
              Both players have staked. Ready to begin the fitness challenge?
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startHealthMonitoring}
            >
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Challenge Active! 🏃‍♂️</Text>
            <Text style={styles.statusDescription}>
              Keep moving! Your fitness data is being tracked automatically.
            </Text>
            {lastDataSubmission && (
              <Text style={styles.lastUpdateText}>
                Last update: {lastDataSubmission.toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Stake: {duelData.challenge.bettingAmount} FITFI each
        </Text>
        <Text style={styles.footerSubtext}>
          Winner takes 85% • Platform fee 10% • Consolation 5%
        </Text>
      </View>
    </View>
  );
}

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  challengeSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeTarget: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  timerLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  scoresSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  leadIndicator: {
    marginTop: 8,
  },
  leadingText: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
  trailingText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    fontWeight: '600',
  },
  tiedText: {
    fontSize: 12,
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
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
  },
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  placeholder: {
    width: 40,
  },
  challengeSection: {
    padding: 20,
    backgroundColor: '#1e293b',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeTarget: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  timerLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  scoresSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
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
  progressText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  leadIndicator: {
    marginTop: 8,
  },
  leadingText: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
  trailingText: {
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
    fontWeight: '600',
  },
  tiedText: {
    fontSize: 12,
    color: '#8b5cf6',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statusCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});
