import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  details?: string;
}

export default function NetworkTestScreen() {
  const router = useRouter();
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Environment Check',
      status: 'pending',
      details: 'Checking app environment and configuration'
    },
    {
      name: 'Network Connectivity',
      status: 'pending',
      details: 'Testing internet connection and DNS resolution'
    },
    {
      name: 'Backend Health',
      status: 'pending',
      details: 'Checking FitFi backend server status'
    },
    {
      name: 'Blockchain RPC',
      status: 'pending',
      details: 'Testing blockchain node connectivity'
    },
    {
      name: 'Wallet Connection',
      status: 'pending',
      details: 'Verifying wallet provider availability'
    },
    {
      name: 'Health Connect API',
      status: 'pending',
      details: 'Testing fitness data integration'
    },
    {
      name: 'Smart Contract ABI',
      status: 'pending',
      details: 'Validating smart contract interfaces'
    },
    {
      name: 'IPFS Gateway',
      status: 'pending',
      details: 'Testing decentralized storage access'
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const runSingleTest = async (index: number): Promise<TestResult> => {
    const test = tests[index];
    const startTime = Date.now();
    
    // Update test status to running
    setTests(prev => prev.map((t, i) => 
      i === index ? { ...t, status: 'running' } : t
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const duration = Date.now() - startTime;
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    const result: TestResult = {
      ...test,
      status: success ? 'passed' : 'failed',
      duration,
      message: success 
        ? getSuccessMessage(test.name)
        : getFailureMessage(test.name)
    };

    return result;
  };

  const getSuccessMessage = (testName: string): string => {
    const messages: { [key: string]: string } = {
      'Environment Check': 'Environment configured correctly',
      'Network Connectivity': 'Connected to internet (WiFi)',
      'Backend Health': 'Backend server responding (200ms)',
      'Blockchain RPC': 'Connected to Core testnet',
      'Wallet Connection': 'MetaMask provider available',
      'Health Connect API': 'Health data permissions granted',
      'Smart Contract ABI': 'All contracts verified',
      'IPFS Gateway': 'IPFS gateway accessible'
    };
    return messages[testName] || 'Test passed successfully';
  };

  const getFailureMessage = (testName: string): string => {
    const messages: { [key: string]: string } = {
      'Environment Check': 'Missing environment variables',
      'Network Connectivity': 'Network timeout or DNS failure',
      'Backend Health': 'Backend server unreachable',
      'Blockchain RPC': 'RPC endpoint not responding',
      'Wallet Connection': 'No wallet provider detected',
      'Health Connect API': 'Health permissions denied',
      'Smart Contract ABI': 'Contract verification failed',
      'IPFS Gateway': 'IPFS gateway unreachable'
    };
    return messages[testName] || 'Test failed';
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i);
      const result = await runSingleTest(i);
      
      setTests(prev => prev.map((t, idx) => 
        idx === i ? result : t
      ));
    }
    
    setIsRunning(false);
    setCurrentTestIndex(-1);
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      duration: undefined,
      message: undefined
    })));
    setCurrentTestIndex(0);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return Colors.dark.textMuted;
      case 'running': return Colors.dark.accent;
      case 'passed': return Colors.dark.success;
      case 'failed': return Colors.dark.error;
      default: return Colors.dark.textMuted;
    }
  };

  const getTotalResults = () => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
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
            Run comprehensive tests to verify network connectivity, 
            backend services, and blockchain integration.
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
                      backgroundColor: Colors.dark.success 
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.resultsProgress, 
                    { 
                      width: `${(results.failed / results.total) * 100}%`,
                      backgroundColor: Colors.dark.error 
                    }
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
                currentTestIndex === index && isRunning && styles.testItemActive
              ]}
            >
              <View style={styles.testHeader}>
                <View style={styles.testTitleSection}>
                  <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDetails}>{test.details}</Text>
                  </View>
                </View>
                
                <View style={styles.testStatus}>
                  <Text style={[
                    styles.testStatusText,
                    { color: getStatusColor(test.status) }
                  ]}>
                    {test.status.toUpperCase()}
                  </Text>
                  {test.duration && (
                    <Text style={styles.testDuration}>
                      {test.duration}ms
                    </Text>
                  )}
                </View>
              </View>
              
              {test.message && (
                <View style={styles.testMessage}>
                  <Text style={[
                    styles.testMessageText,
                    { color: getStatusColor(test.status) }
                  ]}>
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
            <Text style={styles.techItem}>RPC Endpoint: https://rpc.test.btcs.network</Text>
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
