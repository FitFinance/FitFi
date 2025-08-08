import { ENV } from './config';
import { apiService } from './ApiService';

export interface NetworkTestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export class NetworkDiagnostics {
  static async runFullDiagnostics(): Promise<NetworkTestResult[]> {
    const results: NetworkTestResult[] = [];

    console.log('🔧 Starting Network Diagnostics...');
    console.log('='.repeat(50));

    // Test 1: Environment Configuration
    console.log('1️⃣ Testing Environment Configuration...');
    try {
      console.log('API_URL:', ENV.API_URL);
      console.log('NODE_ENV:', ENV.NODE_ENV);
      console.log('DEBUG_MODE:', ENV.DEBUG_MODE);

      results.push({
        test: 'Environment Config',
        success: true,
        message: `API URL: ${ENV.API_URL}`,
        details: {
          apiUrl: ENV.API_URL,
          nodeEnv: ENV.NODE_ENV,
          debugMode: ENV.DEBUG_MODE,
        },
      });
    } catch (error: any) {
      results.push({
        test: 'Environment Config',
        success: false,
        message: 'Failed to read environment configuration',
        details: error.message,
      });
    }

    // Test 2: Basic Internet Connectivity
    console.log('2️⃣ Testing Basic Internet Connectivity...');
    const start2 = Date.now();
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const duration = Date.now() - start2;

      if (response.ok) {
        console.log('✅ Internet connectivity: OK');
        results.push({
          test: 'Internet Connectivity',
          success: true,
          message: 'Internet connection working',
          duration,
        });
      } else {
        console.log('❌ Internet connectivity: Failed');
        results.push({
          test: 'Internet Connectivity',
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error: any) {
      const duration = Date.now() - start2;
      console.log('❌ Internet connectivity error:', error.message);
      results.push({
        test: 'Internet Connectivity',
        success: false,
        message: `Network error: ${error.message}`,
        duration,
      });
    }

    // Test 3: Backend Server Reachability
    console.log('3️⃣ Testing Backend Server Reachability...');
    const start3 = Date.now();
    try {
      const backendUrl = ENV.API_URL.replace('/api/v1', '');
      console.log('Testing backend URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: { Accept: 'text/html,application/json' },
      });

      const duration = Date.now() - start3;
      console.log('Backend response status:', response.status);
      console.log(
        'Backend response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.status === 200 || response.status === 404) {
        console.log('✅ Backend reachability: OK');
        results.push({
          test: 'Backend Reachability',
          success: true,
          message: `Backend responding (${response.status})`,
          duration,
          details: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
          },
        });
      } else {
        console.log('❌ Backend reachability: Failed');
        results.push({
          test: 'Backend Reachability',
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error: any) {
      const duration = Date.now() - start3;
      console.log('❌ Backend reachability error:', error.message);
      results.push({
        test: 'Backend Reachability',
        success: false,
        message: `Cannot reach backend: ${error.message}`,
        duration,
      });
    }

    // Test 4: Raw API Call
    console.log('4️⃣ Testing Raw API Call...');
    const start4 = Date.now();
    try {
      const response = await fetch(`${ENV.API_URL}/auth/get-nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          walletAddress: '0x1234567890123456789012345678901234567890',
        }),
      });

      const duration = Date.now() - start4;
      console.log('Raw API response status:', response.status);
      console.log(
        'Raw API response headers:',
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log(
        'Raw API response body (first 200 chars):',
        responseText.substring(0, 200)
      );

      if (response.ok) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ Raw API call: Success');
          results.push({
            test: 'Raw API Call',
            success: true,
            message: 'Raw API call successful',
            duration,
            details: jsonData,
          });
        } catch {
          console.log('❌ Raw API call: Response not JSON');
          results.push({
            test: 'Raw API Call',
            success: false,
            message: 'Response not JSON',
            duration,
            details: { responseText: responseText.substring(0, 100) },
          });
        }
      } else {
        console.log('❌ Raw API call: HTTP error');
        results.push({
          test: 'Raw API Call',
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
          details: { responseText: responseText.substring(0, 100) },
        });
      }
    } catch (error: any) {
      const duration = Date.now() - start4;
      console.log('❌ Raw API call error:', error.message);
      results.push({
        test: 'Raw API Call',
        success: false,
        message: `Raw fetch error: ${error.message}`,
        duration,
      });
    }

    // Test 5: API Service Call
    console.log('5️⃣ Testing API Service Call...');
    const start5 = Date.now();
    try {
      const response = await apiService.requestNonce(
        '0x1234567890123456789012345678901234567890'
      );
      const duration = Date.now() - start5;

      if (response.success) {
        console.log('✅ API Service call: Success');
        results.push({
          test: 'API Service Call',
          success: true,
          message: 'API service working correctly',
          duration,
          details: response.data,
        });
      } else {
        console.log('❌ API Service call: Failed');
        results.push({
          test: 'API Service Call',
          success: false,
          message: response.message,
          duration,
          details: response,
        });
      }
    } catch (error: any) {
      const duration = Date.now() - start5;
      console.log('❌ API Service call error:', error.message);
      results.push({
        test: 'API Service Call',
        success: false,
        message: `API service error: ${error.message}`,
        duration,
      });
    }

    console.log('='.repeat(50));
    console.log('🔧 Network Diagnostics Complete');
    console.log('Results Summary:');
    results.forEach((result) => {
      console.log(
        `${result.success ? '✅' : '❌'} ${result.test}: ${result.message}`
      );
    });

    return results;
  }

  static async quickConnectivityTest(): Promise<boolean> {
    try {
      console.log('🚀 Quick connectivity test...');

      const response = await fetch(`${ENV.API_URL}/auth/get-nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: '0x1234567890123456789012345678901234567890',
        }),
      });

      const success = response.ok;
      console.log(
        `${success ? '✅' : '❌'} Quick test result: ${success ? 'Connected' : 'Failed'}`
      );

      return success;
    } catch (error) {
      console.log('❌ Quick test failed:', error);
      return false;
    }
  }
}
