import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { apiService } from '../utils/ApiService';
import { ENV } from '../utils/config';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function NetworkTestScreen() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateTest = (
    testName: string,
    status: TestResult['status'],
    message: string,
    details?: any
  ) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.test === testName);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { test: testName, status, message, details }];
      }
    });
  };

  const runNetworkTests = async () => {
    setTesting(true);
    setTests([]);

    // Test 1: Environment Configuration
    updateTest('Environment Config', 'pending', 'Checking configuration...');
    try {
      console.log('🔧 Environment Configuration:');
      console.log('API_URL:', ENV.API_URL);
      console.log('NODE_ENV:', ENV.NODE_ENV);
      console.log('DEBUG_MODE:', ENV.DEBUG_MODE);

      updateTest('Environment Config', 'success', `API URL: ${ENV.API_URL}`, {
        apiUrl: ENV.API_URL,
        nodeEnv: ENV.NODE_ENV,
        debugMode: ENV.DEBUG_MODE,
      });
    } catch (error) {
      updateTest('Environment Config', 'error', 'Failed to read environment');
    }

    // Test 2: Basic Network Connectivity
    updateTest('Basic Connectivity', 'pending', 'Testing basic network...');
    try {
      console.log('🌐 Testing basic network connectivity...');

      // Try to reach a known endpoint
      const testResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (testResponse.ok) {
        updateTest(
          'Basic Connectivity',
          'success',
          'Internet connection working'
        );
      } else {
        updateTest(
          'Basic Connectivity',
          'error',
          `HTTP ${testResponse.status}: ${testResponse.statusText}`
        );
      }
    } catch (error: any) {
      console.error('❌ Basic connectivity failed:', error);
      updateTest(
        'Basic Connectivity',
        'error',
        `Network error: ${error.message}`
      );
    }

    // Test 3: Backend Server Reachability
    updateTest('Backend Reachability', 'pending', 'Testing backend server...');
    try {
      console.log('🎯 Testing backend server reachability...');

      const backendUrl = ENV.API_URL.replace('/api/v1', '');
      console.log('Testing backend URL:', backendUrl);

      const serverResponse = await fetch(backendUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      console.log('Backend response status:', serverResponse.status);
      console.log(
        'Backend response headers:',
        Object.fromEntries(serverResponse.headers.entries())
      );

      if (serverResponse.status === 200 || serverResponse.status === 404) {
        updateTest(
          'Backend Reachability',
          'success',
          `Backend responding (${serverResponse.status})`
        );
      } else {
        updateTest(
          'Backend Reachability',
          'error',
          `HTTP ${serverResponse.status}: ${serverResponse.statusText}`
        );
      }
    } catch (error: any) {
      console.error('❌ Backend reachability failed:', error);
      updateTest(
        'Backend Reachability',
        'error',
        `Cannot reach backend: ${error.message}`
      );
    }

    // Test 4: API Endpoint Test
    updateTest('API Endpoint', 'pending', 'Testing API endpoint...');
    try {
      console.log('🔐 Testing API endpoint...');

      const response = await apiService.requestNonce(
        '0x1234567890123456789012345678901234567890'
      );

      if (response.success) {
        updateTest(
          'API Endpoint',
          'success',
          'API endpoint working',
          response.data
        );
      } else {
        updateTest('API Endpoint', 'error', response.message, response);
      }
    } catch (error: any) {
      console.error('❌ API endpoint failed:', error);
      updateTest('API Endpoint', 'error', `API error: ${error.message}`);
    }

    // Test 5: Raw Fetch to API
    updateTest('Raw API Fetch', 'pending', 'Testing raw fetch to API...');
    try {
      console.log('📡 Testing raw fetch to API...');

      const rawResponse = await fetch(`${ENV.API_URL}/auth/get-nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: '0x1234567890123456789012345678901234567890',
        }),
      });

      console.log('Raw API response status:', rawResponse.status);
      console.log(
        'Raw API response headers:',
        Object.fromEntries(rawResponse.headers.entries())
      );

      const responseText = await rawResponse.text();
      console.log(
        'Raw API response body (first 200 chars):',
        responseText.substring(0, 200)
      );

      if (rawResponse.ok) {
        try {
          const jsonData = JSON.parse(responseText);
          updateTest(
            'Raw API Fetch',
            'success',
            'Raw API call successful',
            jsonData
          );
        } catch {
          updateTest('Raw API Fetch', 'error', 'Response not JSON', {
            responseText: responseText.substring(0, 100),
          });
        }
      } else {
        updateTest(
          'Raw API Fetch',
          'error',
          `HTTP ${rawResponse.status}: ${rawResponse.statusText}`,
          { responseText: responseText.substring(0, 100) }
        );
      }
    } catch (error: any) {
      console.error('❌ Raw API fetch failed:', error);
      updateTest('Raw API Fetch', 'error', `Raw fetch error: ${error.message}`);
    }

    setTesting(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '⚪';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network Diagnostics</Text>
        <Text style={styles.subtitle}>
          Debug network connectivity and API access
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, testing && styles.disabledButton]}
        onPress={runNetworkTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Running Tests...' : 'Run Network Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        {tests.map((test, index) => (
          <View key={index} style={styles.testResult}>
            <View style={styles.testHeader}>
              <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
              <Text style={styles.testName}>{test.test}</Text>
            </View>
            <Text
              style={[
                styles.testMessage,
                { color: getStatusColor(test.status) },
              ]}
            >
              {test.message}
            </Text>
            {test.details && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Test Details',
                    JSON.stringify(test.details, null, 2)
                  )
                }
              >
                <Text style={styles.detailsLink}>View Details</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Current Configuration:</Text>
        <Text style={styles.infoText}>API URL: {ENV.API_URL}</Text>
        <Text style={styles.infoText}>Environment: {ENV.NODE_ENV}</Text>
        <Text style={styles.infoText}>
          Debug Mode: {ENV.DEBUG_MODE ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  testResult: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  detailsLink: {
    fontSize: 12,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  infoContainer: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
});
