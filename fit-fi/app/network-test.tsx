import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';
import {
  ENV_CONFIG,
  envLog,
  validateEnvironment,
} from '@/services/EnvironmentConfig';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  details?: string;
}

interface BackendTestResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  message: string;
  details?: string;
}

// Add a cached diagnostics response to avoid multiple network calls
let cachedDiagnostics: any | null = null;
let cachedAt: number = 0;
const DIAGNOSTICS_CACHE_TTL = 10_000; // 10s

export default function NetworkTestScreen() {
  const router = useRouter();
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Environment Check',
      status: 'pending',
      details: 'Checking app environment and configuration',
    },
    {
      name: 'Network Connectivity',
      status: 'pending',
      details: 'Testing internet connection and DNS resolution',
    },
    {
      name: 'Backend Health',
      status: 'pending',
      details: 'Checking FitFi backend server status',
    },
    {
      name: 'Database Connectivity',
      status: 'pending',
      details: 'Testing database connection',
    },
    {
      name: 'Redis Connectivity',
      status: 'pending',
      details: 'Testing Redis cache connection',
    },
    {
      name: 'Blockchain RPC',
      status: 'pending',
      details: 'Testing blockchain node connectivity',
    },
    {
      name: 'Wallet Connection',
      status: 'pending',
      details: 'Verifying wallet auth flow integrity',
    },
    {
      name: 'Backend Diagnostics',
      status: 'pending',
      details: 'Running comprehensive backend tests',
    },
    {
      name: 'Authentication Test',
      status: 'pending',
      details: 'Testing wallet authentication endpoint reachability',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Configuration
  const BASE_URL = ENV_CONFIG.apiBaseUrl;

  const fetchDiagnostics = async (): Promise<any | null> => {
    const now = Date.now();
    if (cachedDiagnostics && now - cachedAt < DIAGNOSTICS_CACHE_TTL) {
      return cachedDiagnostics;
    }
    try {
      const resp = await fetch(`${BASE_URL}/test/network-diagnostics`);
      const json = await resp.json();
      if (resp.status === 200 && json.success) {
        cachedDiagnostics = json;
        cachedAt = now;
        return json;
      }
      return null;
    } catch {
      return null;
    }
  };

  const extractBackendTest = (
    data: any,
    name: string
  ): BackendTestResult | null => {
    try {
      return data?.data?.tests?.find((t: any) => t.name === name) || null;
    } catch {
      return null;
    }
  };

  const runSingleTest = async (index: number): Promise<TestResult> => {
    const test = tests[index];
    const startTime = Date.now();

    // Update test status to running
    setTests((prev) =>
      prev.map((t, i) => (i === index ? { ...t, status: 'running' } : t))
    );

    let result: TestResult;

    try {
      switch (test.name) {
        case 'Environment Check':
          result = await runEnvironmentCheck(test, startTime);
          break;
        case 'Network Connectivity':
          result = await runNetworkConnectivityTest(test, startTime);
          break;
        case 'Backend Health':
          result = await runBackendHealthTest(test, startTime);
          break;
        case 'Database Connectivity':
          result = await runDatabaseTest(test, startTime);
          break;
        case 'Redis Connectivity':
          result = await runRedisTest(test, startTime);
          break;
        case 'Blockchain RPC':
          result = await runBlockchainTest(test, startTime);
          break;
        case 'Wallet Connection':
          result = await runWalletTest(test, startTime);
          break;
        case 'Backend Diagnostics':
          result = await runBackendDiagnostics(test, startTime);
          break;
        case 'Authentication Test':
          result = await runAuthTest(test, startTime);
          break;
        default:
          result = await runGenericTest(test, startTime);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      result = {
        ...test,
        status: 'failed',
        duration,
        message: `Test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }

    return result;
  };

  const runEnvironmentCheck = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      // Validate environment configuration
      const envValidation = validateEnvironment();
      const duration = Date.now() - startTime;

      if (!envValidation.valid) {
        return {
          ...test,
          status: 'failed',
          duration,
          message: `Environment validation failed: ${envValidation.errors.length} errors`,
          details: envValidation.errors.join(', '),
        };
      }

      // Check if running in development/production
      const isDev = __DEV__;

      envLog('info', 'Environment check completed', {
        isDev,
        apiBaseUrl: ENV_CONFIG.apiBaseUrl,
        appEnv: ENV_CONFIG.appEnv,
      });

      return {
        ...test,
        status: 'passed',
        duration,
        message: `Environment: ${ENV_CONFIG.appEnv}, API: ${ENV_CONFIG.apiBaseUrl}`,
        details: 'All environment variables are properly configured',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runNetworkConnectivityTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      // Test basic internet connectivity by trying to reach a simple endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      const success = response.status === 200;

      return {
        ...test,
        status: success ? 'passed' : 'failed',
        duration,
        message: success
          ? 'Internet connectivity working'
          : 'No internet connection',
        details: `HTTP status: ${response.status}`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Network connectivity failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runBackendHealthTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}/test/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const duration = Date.now() - startTime;
      const success = response.status === 200 && data.success;

      return {
        ...test,
        status: success ? 'passed' : 'failed',
        duration,
        message: success
          ? data.message || 'Backend is healthy'
          : 'Backend health check failed',
        details: success
          ? `Response time: ${data.data?.responseTime || duration + 'ms'}`
          : `HTTP ${response.status}`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Backend server unreachable',
        details: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const runDatabaseTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const diag = await fetchDiagnostics();
      const duration = Date.now() - startTime;
      const dbTest = extractBackendTest(diag, 'Database Connectivity');
      if (dbTest) {
        return {
          ...test,
          status: dbTest.status,
          duration,
          message: dbTest.message,
          details: dbTest.details,
        };
      }
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Database test not available',
        details: 'Missing in diagnostics',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Database connectivity test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runRedisTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const diag = await fetchDiagnostics();
      const duration = Date.now() - startTime;
      const redisTest = extractBackendTest(diag, 'Redis Connectivity');
      if (redisTest) {
        return {
          ...test,
          status: redisTest.status,
          duration,
          message: redisTest.message,
          details: redisTest.details,
        };
      }
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Redis test not available',
        details: 'Missing in diagnostics',
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Redis connectivity test failed',
        details: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  };

  const runBlockchainTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const diag = await fetchDiagnostics();
      const duration = Date.now() - startTime;
      const bcTest = extractBackendTest(diag, 'Blockchain RPC');
      if (bcTest) {
        return {
          ...test,
          status: bcTest.status,
          duration,
          message: bcTest.message,
          details: bcTest.details,
        };
      }
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Blockchain test not available',
        details: 'Missing in diagnostics',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Blockchain RPC test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runWalletTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const diag = await fetchDiagnostics();
      const duration = Date.now() - startTime;
      const walletTest = extractBackendTest(diag, 'Wallet Connection');
      if (walletTest) {
        return {
          ...test,
          status: walletTest.status,
          duration,
          message: walletTest.message,
          details: walletTest.details,
        };
      }
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Wallet test unavailable',
        details: 'Missing in diagnostics',
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Wallet test failed',
        details: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  };

  const runBackendDiagnostics = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      const diag = await fetchDiagnostics();
      const duration = Date.now() - startTime;
      if (diag) {
        const summary = diag.data.summary;
        return {
          ...test,
          status: summary.overallStatus === 'healthy' ? 'passed' : 'failed',
          duration,
          message: `Backend diagnostics: ${summary.passedTests}/${summary.totalTests} tests passed`,
          details: `Overall status: ${summary.overallStatus}`,
        };
      }
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Backend diagnostics failed',
        details: 'No data returned',
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Backend diagnostics unavailable',
        details: e instanceof Error ? e.message : 'Connection failed',
      };
    }
  };

  const runAuthTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    try {
      // Test if the wallet auth endpoint is reachable (without actually authenticating)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}/auth/wallet-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: 'test',
          signature: 'test',
          message: 'test',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // We expect this to fail validation, but the endpoint should be reachable
      const endpointReachable = response.status !== undefined;

      return {
        ...test,
        status: endpointReachable ? 'passed' : 'failed',
        duration,
        message: endpointReachable
          ? 'Authentication endpoint is reachable'
          : 'Authentication endpoint unreachable',
        details: `HTTP ${response.status} (expected validation error)`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: 'Authentication endpoint test failed',
        details: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const runGenericTest = async (
    test: TestResult,
    startTime: number
  ): Promise<TestResult> => {
    // Simulate test execution
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 2000 + 1000)
    );

    const duration = Date.now() - startTime;
    const success = Math.random() > 0.3; // 70% success rate for demo

    return {
      ...test,
      status: success ? 'passed' : 'failed',
      duration,
      message: success ? 'Test completed successfully' : 'Test failed',
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i);
      const result = await runSingleTest(i);

      setTests((prev) => prev.map((t, idx) => (idx === i ? result : t)));
    }

    setIsRunning(false);
    setCurrentTestIndex(-1);
  };

  const resetTests = () => {
    setTests((prev) =>
      prev.map((test) => ({
        ...test,
        status: 'pending',
        duration: undefined,
        message: undefined,
      }))
    );
    setCurrentTestIndex(0);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return Colors.dark.textMuted;
      case 'running':
        return Colors.dark.accent;
      case 'passed':
        return Colors.dark.success;
      case 'failed':
        return Colors.dark.error;
      default:
        return Colors.dark.textMuted;
    }
  };

  const getTotalResults = () => {
    const passed = tests.filter((t) => t.status === 'passed').length;
    const failed = tests.filter((t) => t.status === 'failed').length;
    const total = tests.length;
    return { passed, failed, total };
  };

  const results = getTotalResults();

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={GlobalStyles.title}>Network Diagnostics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Test Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>System Diagnostics</Text>
          <Text style={styles.summaryDescription}>
            Run comprehensive tests to verify network connectivity, backend
            services, and blockchain integration.
          </Text>

          {!isRunning && results.total > 0 && (
            <View style={styles.resultsOverview}>
              <Text style={styles.resultsText}>
                Results: {results.passed} passed, {results.failed} failed
              </Text>
              <View style={styles.resultsBar}>
                <View
                  style={[
                    styles.resultsProgress,
                    {
                      width: `${(results.passed / results.total) * 100}%`,
                      backgroundColor: Colors.dark.success,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.resultsProgress,
                    {
                      width: `${(results.failed / results.total) * 100}%`,
                      backgroundColor: Colors.dark.error,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controlSection}>
          <TouchableOpacity
            style={[GlobalStyles.button, isRunning && styles.buttonDisabled]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text style={GlobalStyles.buttonTextPrimary}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>

          {!isRunning && results.total > 0 && (
            <TouchableOpacity
              style={GlobalStyles.buttonSecondary}
              onPress={resetTests}
            >
              <Text style={GlobalStyles.buttonText}>Reset Tests</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Test Results */}
        <View style={styles.testsSection}>
          <Text style={styles.testsTitle}>Test Results</Text>

          {tests.map((test, index) => (
            <View
              key={index}
              style={[
                styles.testItem,
                currentTestIndex === index &&
                  isRunning &&
                  styles.testItemActive,
              ]}
            >
              <View style={styles.testHeader}>
                <View style={styles.testTitleSection}>
                  <Text style={styles.testIcon}>
                    {getStatusIcon(test.status)}
                  </Text>
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDetails}>{test.details}</Text>
                  </View>
                </View>

                <View style={styles.testStatus}>
                  <Text
                    style={[
                      styles.testStatusText,
                      { color: getStatusColor(test.status) },
                    ]}
                  >
                    {test.status.toUpperCase()}
                  </Text>
                  {test.duration && (
                    <Text style={styles.testDuration}>{test.duration}ms</Text>
                  )}
                </View>
              </View>

              {test.message && (
                <View style={styles.testMessage}>
                  <Text
                    style={[
                      styles.testMessageText,
                      { color: getStatusColor(test.status) },
                    ]}
                  >
                    {test.message}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Troubleshooting Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>🛠️ Troubleshooting Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Check your internet connection if network tests fail
            </Text>
            <Text style={styles.tipItem}>
              • Ensure wallet extension is installed and unlocked
            </Text>
            <Text style={styles.tipItem}>
              • Grant Health Connect permissions in device settings
            </Text>
            <Text style={styles.tipItem}>
              • Try switching to a different network if blockchain tests fail
            </Text>
            <Text style={styles.tipItem}>
              • Restart the app if multiple tests are failing
            </Text>
          </View>
        </View>

        {/* Technical Info */}
        <View style={styles.techSection}>
          <Text style={styles.techTitle}>Technical Information</Text>
          <View style={styles.techInfo}>
            <Text style={styles.techItem}>Environment: Development</Text>
            <Text style={styles.techItem}>Network: Core Testnet</Text>
            <Text style={styles.techItem}>
              RPC Endpoint: https://rpc.test.btcs.network
            </Text>
            <Text style={styles.techItem}>Backend: fitfi-api.example.com</Text>
            <Text style={styles.techItem}>App Version: 1.0.0 (Build 1234)</Text>
          </View>
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
  summarySection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  resultsOverview: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  resultsBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultsProgress: {
    height: '100%',
  },
  controlSection: {
    marginBottom: 20,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testsSection: {
    marginBottom: 20,
  },
  testsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  testItem: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  testItemActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.surfaceSecondary,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testTitleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  testDetails: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  testStatus: {
    alignItems: 'flex-end',
  },
  testStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  testDuration: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  testMessage: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  testMessageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  techSection: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  techInfo: {
    gap: 4,
  },
  techItem: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontFamily: 'monospace',
  },
};
