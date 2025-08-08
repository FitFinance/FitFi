import { Alert, Linking } from 'react-native';
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';
import { ethers } from 'ethers';
import { ENV } from './config';

// WalletConnect Project ID from cloud.walletconnect.com
const PROJECT_ID = ENV.WALLETCONNECT_PROJECT_ID;

type SignResult = {
  signature: string;
  address: string;
  method: 'personal_sign' | 'eth_signTypedData_v4' | 'eth_sign';
  chainId: string; // e.g., 'eip155:1'
};

export class WalletConnectService {
  private static client: SignClient | null = null;
  private static session: SessionTypes.Struct | null = null;
  private static lastWalletReopenUrl: string | null = null; // e.g., 'metamask://' or universal link

  static async connectAndSign(
    message: string,
    nonce: number
  ): Promise<SignResult> {
    try {
      await this.ensureClient();

      // If we already have a session, reuse it
      if (!this.session) {
        const requiredNamespaces = {
          eip155: {
            methods: [
              'personal_sign',
              'eth_sign',
              'eth_signTypedData',
              'eth_signTypedData_v4',
            ],
            chains: ['eip155:1', 'eip155:137'], // Ethereum + Polygon
            events: ['accountsChanged', 'chainChanged'],
          },
        } as const;

        const { uri, approval } = await this.client!.connect({
          requiredNamespaces,
        });

        if (uri) {
          // Prompt user to choose a wallet and deep link with the wc uri
          await this.openWalletChoice(uri);
        }

        this.session = await approval();
      }

      // Extract address and a valid chainId from session
      const ns = this.session!.namespaces;
      const eipNs = ns.eip155;
      const account = eipNs.accounts[0]; // format: eip155:1:0xabc...
      const [namespace, chain, address] = account.split(':');
      const chainId = `${namespace}:${chain}`;
      const chainIdNum = parseInt(chain, 10) || 1;

      // Foreground the wallet so user sees the request UI
      if (this.lastWalletReopenUrl) {
        try {
          await Linking.openURL(this.lastWalletReopenUrl);
        } catch {}
      }

      let signature: string;
      let method: SignResult['method'] = 'personal_sign';
      const hexMsg = ethers.hexlify(ethers.toUtf8Bytes(message));
      try {
        // Try personal_sign first
        signature = (await this.client!.request({
          topic: this.session!.topic,
          chainId,
          request: {
            method: 'personal_sign',
            // Many wallets expect 0x-hex for personal_sign
            params: [hexMsg, address],
          },
        })) as string;
        method = 'personal_sign';
      } catch (e) {
        // Next fallback: EIP-712 typed data (many wallets prefer this)
        try {
          const domain = {
            name: 'FitFi',
            version: '1',
            chainId: chainIdNum,
          } as const;
          const types = {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
            ],
            FitFiLogin: [
              { name: 'statement', type: 'string' },
              { name: 'wallet', type: 'address' },
              { name: 'nonce', type: 'uint256' },
            ],
          } as const;
          const messageTyped = {
            statement: 'Sign in to FitFi',
            wallet: address,
            nonce: BigInt(nonce),
          } as const;
          const typedData = {
            types,
            domain,
            primaryType: 'FitFiLogin',
            message: messageTyped,
          } as const;

          if (this.lastWalletReopenUrl) {
            try {
              await Linking.openURL(this.lastWalletReopenUrl);
            } catch {}
          }
          signature = (await this.client!.request({
            topic: this.session!.topic,
            chainId,
            request: {
              method: 'eth_signTypedData_v4',
              // MetaMask expects [address, JSON-stringified typed data]
              params: [address, JSON.stringify(typedData)],
            },
          })) as string;
          method = 'eth_signTypedData_v4';
        } catch (e2) {
          // Final fallback: eth_sign
          if (this.lastWalletReopenUrl) {
            try {
              await Linking.openURL(this.lastWalletReopenUrl);
            } catch {}
          }
          signature = (await this.client!.request({
            topic: this.session!.topic,
            chainId,
            request: {
              method: 'eth_sign',
              // eth_sign strictly requires [address, 0x-hex-message]
              params: [address, hexMsg],
            },
          })) as string;
          method = 'eth_sign';
        }
      }

      return { signature, address, method, chainId };
    } catch (error: any) {
      console.error('❌ WalletConnect signing failed:', error);
      throw new Error(
        error?.message || 'Failed to connect wallet and sign the message'
      );
    }
  }

  private static async ensureClient() {
    if (this.client) return;
    this.client = await SignClient.init({
      projectId: PROJECT_ID,
      metadata: {
        name: 'FitFi',
        description: 'FitFi Mobile App',
        url: 'https://fitfi.app',
        icons: [
          'https://raw.githubusercontent.com/FitFinance/FitFi/main/logo.png',
        ],
      },
    });
  }

  private static async openWalletChoice(uri: string) {
    return new Promise<void>((resolve, reject) => {
      const deepLinks = {
        metamask: {
          scheme: `metamask://wc?uri=${encodeURIComponent(uri)}`,
          universal: `https://metamask.app.link/wc?uri=${encodeURIComponent(
            uri
          )}`,
          store: 'https://play.google.com/store/apps/details?id=io.metamask',
          reopen: 'metamask://',
        },
        trust: {
          scheme: `trust://wc?uri=${encodeURIComponent(uri)}`,
          universal: `https://link.trustwallet.com/wc?uri=${encodeURIComponent(
            uri
          )}`,
          store:
            'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
          reopen: 'trust://',
        },
        rainbow: {
          scheme: `rainbow://wc?uri=${encodeURIComponent(uri)}`,
          universal: `https://rnbwapp.com/wc?uri=${encodeURIComponent(uri)}`,
          store: 'https://play.google.com/store/apps/details?id=me.rainbow',
          reopen: 'rainbow://',
        },
        zerion: {
          scheme: `zerion://wc?uri=${encodeURIComponent(uri)}`,
          universal: `https://wallet.zerion.io/wc?uri=${encodeURIComponent(
            uri
          )}`,
          store:
            'https://play.google.com/store/apps/details?id=io.zerion.android',
          reopen: 'zerion://',
        },
      } as const;

      Alert.alert(
        'Connect Wallet',
        'Choose a wallet to approve the connection and sign.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () =>
              reject(new Error('User cancelled wallet connection')),
          },
          {
            text: 'MetaMask',
            onPress: async () => {
              this.lastWalletReopenUrl = deepLinks.metamask.reopen;
              await this.openDeepLinkOrStore(deepLinks.metamask).catch(reject);
              resolve();
            },
          },
          {
            text: 'Trust Wallet',
            onPress: async () => {
              this.lastWalletReopenUrl = deepLinks.trust.reopen;
              await this.openDeepLinkOrStore(deepLinks.trust).catch(reject);
              resolve();
            },
          },
          {
            text: 'Rainbow',
            onPress: async () => {
              this.lastWalletReopenUrl = deepLinks.rainbow.reopen;
              await this.openDeepLinkOrStore(deepLinks.rainbow).catch(reject);
              resolve();
            },
          },
        ]
      );
    });
  }

  private static async openDeepLinkOrStore(opts: {
    scheme: string;
    universal: string;
    store: string;
  }) {
    const tryOpen = async (url: string) => {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    };

    if (await tryOpen(opts.scheme)) return;
    if (await tryOpen(opts.universal)) return;

    Alert.alert(
      'Wallet Not Found',
      'Redirecting to the Play Store to install the wallet.',
      [
        {
          text: 'Open Store',
          onPress: () => Linking.openURL(opts.store),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
    throw new Error('Wallet app not installed');
  }

  static async disconnect() {
    try {
      if (this.client && this.session) {
        await this.client.disconnect({
          topic: this.session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        });
      }
    } catch (e) {
      // best-effort
    } finally {
      this.session = null;
    }
  }

  static isConnected(): boolean {
    return !!this.session;
  }

  static getConnectedAddress(): string | null {
    try {
      const account = this.session?.namespaces?.eip155?.accounts?.[0];
      if (!account) return null;
      return account.split(':')[2] || null;
    } catch {
      return null;
    }
  }
}
