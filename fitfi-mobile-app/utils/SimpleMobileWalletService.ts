import { Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';

class SimpleMobileWalletService {
  /**
   * Check if MetaMask mobile app is installed
   */
  async isWalletAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && !!(window as any).ethereum;
    }

    // For mobile, check if MetaMask app is installed via deep linking
    try {
      const metamaskSchemes = ['metamask://', 'https://metamask.app.link/'];

      for (const scheme of metamaskSchemes) {
        const canOpen = await Linking.canOpenURL(scheme);
        if (canOpen) {
          console.log('✅ MetaMask mobile app detected via:', scheme);
          return true;
        }
      }

      console.log('❌ MetaMask mobile app not detected');
      return false;
    } catch (error) {
      console.error('Error checking wallet availability:', error);
      return false;
    }
  }

  /**
   * Open MetaMask mobile app
   */
  async openMetaMask(): Promise<void> {
    try {
      const metamaskUrl = 'metamask://';
      const canOpen = await Linking.canOpenURL(metamaskUrl);

      if (canOpen) {
        await Linking.openURL(metamaskUrl);
      } else {
        // Try universal link
        const universalLink = 'https://metamask.app.link/';
        await Linking.openURL(universalLink);
      }
    } catch (error) {
      console.error('Failed to open MetaMask:', error);
      throw new Error('Could not open MetaMask mobile app');
    }
  }

  /**
   * Start the mobile wallet connection process
   * Direct wallet address entry approach
   */
  async startMobileWalletConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Connect Your Wallet',
        'Please enter your MetaMask wallet address to continue.\n\nYou can find your address by opening MetaMask and copying it.',
        [
          {
            text: 'Enter Address',
            onPress: () => this.promptForWalletAddress(resolve, reject),
          },
          {
            text: 'Open MetaMask First',
            onPress: async () => {
              try {
                await this.openMetaMask();
                // Give user time to copy address from MetaMask
                setTimeout(() => {
                  this.promptForWalletAddress(resolve, reject);
                }, 1000);
              } catch (error) {
                reject(error);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('User cancelled')),
          },
        ]
      );
    });
  }

  /**
   * Prompt user to enter their wallet address
   */
  private promptForWalletAddress(resolve: Function, reject: Function): void {
    Alert.prompt(
      'Enter Wallet Address',
      'Please paste your MetaMask wallet address (starts with 0x):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => reject(new Error('User cancelled')),
        },
        {
          text: 'Continue',
          onPress: (address) => {
            if (this.isValidWalletAddress(address)) {
              resolve(address);
            } else {
              Alert.alert(
                'Invalid Address',
                'Please enter a valid Ethereum wallet address (42 characters starting with 0x)',
                [
                  {
                    text: 'Try Again',
                    onPress: () => this.promptForWalletAddress(resolve, reject),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => reject(new Error('Invalid address')),
                  },
                ]
              );
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }

  /**
   * Validate wallet address format
   */
  private isValidWalletAddress(address?: string): boolean {
    return !!(
      address &&
      address.length === 42 &&
      address.startsWith('0x') &&
      /^0x[a-fA-F0-9]{40}$/.test(address)
    );
  }

  /**
   * Guide user through signing a message in MetaMask
   */
  async signMessageWithMobile(
    message: string,
    walletAddress: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Sign Message in MetaMask',
        `Please follow these steps:\n\n1. Open MetaMask mobile app\n2. Go to Settings → Advanced → Sign Message\n3. Sign this exact message:\n\n"${message}"\n\n4. Copy the signature and return here`,
        [
          {
            text: 'Open MetaMask',
            onPress: async () => {
              try {
                await this.openMetaMask();
                setTimeout(() => {
                  this.promptForSignature(message, resolve, reject);
                }, 2000);
              } catch (error) {
                reject(error);
              }
            },
          },
          {
            text: 'I have signature',
            onPress: () => this.promptForSignature(message, resolve, reject),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('User cancelled signing')),
          },
        ]
      );
    });
  }

  /**
   * Prompt user to enter the signature from MetaMask
   */
  private promptForSignature(
    message: string,
    resolve: Function,
    reject: Function
  ): void {
    Alert.prompt(
      'Enter Signature',
      'Paste the signature from MetaMask (starts with 0x):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => reject(new Error('User cancelled')),
        },
        {
          text: 'Verify',
          onPress: (signature) => {
            if (this.isValidSignature(signature)) {
              resolve(signature);
            } else {
              Alert.alert(
                'Invalid Signature',
                'Please enter a valid signature (130+ characters starting with 0x)',
                [
                  {
                    text: 'Try Again',
                    onPress: () =>
                      this.promptForSignature(message, resolve, reject),
                  },
                  {
                    text: 'Show Instructions',
                    onPress: () => {
                      Alert.alert(
                        'How to Sign in MetaMask',
                        'In MetaMask mobile app:\n\n1. Tap menu (☰)\n2. Go to Settings\n3. Tap Advanced\n4. Tap Sign Message\n5. Enter the message shown earlier\n6. Tap Sign\n7. Copy the signature',
                        [
                          {
                            text: 'Got it',
                            onPress: () =>
                              this.promptForSignature(message, resolve, reject),
                          },
                        ]
                      );
                    },
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => reject(new Error('Invalid signature')),
                  },
                ]
              );
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }

  /**
   * Validate signature format
   */
  private isValidSignature(signature?: string): boolean {
    return !!(
      signature &&
      signature.length >= 130 &&
      signature.startsWith('0x') &&
      /^0x[a-fA-F0-9]+$/.test(signature)
    );
  }

  /**
   * Get app store URL for MetaMask
   */
  getMetaMaskStoreURL(): string {
    return Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/metamask/id1438144202'
      : 'https://play.google.com/store/apps/details?id=io.metamask';
  }
}

export const simpleMobileWalletService = new SimpleMobileWalletService();
export default simpleMobileWalletService;
