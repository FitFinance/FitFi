import { Alert, Linking } from 'react-native';
import { SignClient } from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';
import { ethers } from 'ethers';

// WalletConnect Project ID from cloud.walletconnect.com
const PROJECT_ID = '3a48a1389fee89b77191ca5754fc252d';

type WalletConnectionResult = {
  address: string;
  signature: string;
  message: string;
};

export class ImprovedWalletService {
  private static client: SignClient | null = null;
  private static session: SessionTypes.Struct | null = null;
  private static lastWalletReopenUrl: string | null = null;
  private static connecting: Promise<SessionTypes.Struct> | null = null; // guard concurrent connects
  private static listenersAttached = false;
  private static lastConnectDeepLinkUsed: string | null = null; // exact URL used to open wallet
  private static DEV_LOG = true; // toggle for verbose logging

  /**
   * Simplified login flow - connects wallet and gets signature in one step
   */
  static async connectWalletAndAuthenticate(): Promise<WalletConnectionResult> {
    try {
      await this.ensureClient();

      // Clear existing session only if we truly want a fresh pairing
      if (this.session) {
        await this.disconnect();
      }

      // Minimal initial chain set for reliability (add others post-connection if needed)
      const requiredNamespaces = {
        eip155: {
          methods: [
            'personal_sign',
            'eth_sign',
            'eth_signTypedData',
            'eth_signTypedData_v4',
          ],
          // start with mainnet only to avoid wallets suppressing UI when unsupported chains included
          chains: ['eip155:1'],
          events: ['accountsChanged', 'chainChanged'],
        },
      } as const;

      if (!this.connecting) {
        this.connecting = (async () => {
          const { uri, approval } = await this.client!.connect({
            requiredNamespaces,
          });
          if (uri) {
            await this.showWalletOptions(uri);
          }
          const sess = await this._awaitWithTimeout(
            approval(),
            20000,
            'Wallet connection timed out'
          );
          return sess;
        })();
      }

      try {
        this.session = await this.connecting;
      } finally {
        this.connecting = null;
      }

      // tiny delay to ensure wallet internal state settled
      await new Promise((r) => setTimeout(r, 200));

      // Extract address from session
      const ns = this.session!.namespaces;
      const eipNs = ns.eip155;
      const account = eipNs.accounts[0]; // format: eip155:1:0xabc...
      const [namespace, chain, address] = account.split(':');
      const chainId = `${namespace}:${chain}`;

      // Create authentication message
      const timestamp = Date.now();
      const message = `Welcome to FitFi!

Please sign this message to authenticate with your wallet.

Address: ${address}
Timestamp: ${timestamp}

By signing, you agree to use FitFi services.`;

      // Ensure wallet foreground before signing
      await this.openWalletApp();

      let signature: string | null = null;
      const utf8Msg = message; // try plain first (personal_sign generally accepts plain string)
      const hexMsg = ethers.hexlify(ethers.toUtf8Bytes(message));

      // helper for signing attempts
      const signAttempt = async (
        method: string,
        params: any[]
      ): Promise<string> => {
        if (this.DEV_LOG) console.log(`[WalletAuth] Trying ${method}`);
        return (await this.client!.request({
          topic: this.session!.topic,
          chainId,
          request: { method, params },
        })) as string;
      };

      try {
        // personal_sign with plain string
        signature = await signAttempt('personal_sign', [utf8Msg, address]);
      } catch (e1) {
        if (this.DEV_LOG)
          console.log(
            '[WalletAuth] personal_sign (utf8) failed, retry hex',
            e1
          );
        try {
          // personal_sign with hex
          await this.openWalletApp();
          signature = await signAttempt('personal_sign', [hexMsg, address]);
        } catch (e2) {
          if (this.DEV_LOG)
            console.log(
              '[WalletAuth] personal_sign (hex) failed, fallback eth_sign',
              e2
            );
          await this.openWalletApp();
          signature = await signAttempt('eth_sign', [address, hexMsg]);
        }
      }

      if (!signature) throw new Error('Failed to obtain signature');

      return {
        address: address.toLowerCase(),
        signature,
        message,
      };
    } catch (error: any) {
      console.error('❌ Wallet authentication failed:', error);
      await this.disconnect();
      throw new Error(
        error?.message || 'Failed to connect wallet and authenticate'
      );
    }
  }

  private static async ensureClient() {
    if (this.client) return;
    // Attempt to reuse across hot reloads in dev
    if (
      typeof globalThis !== 'undefined' &&
      (globalThis as any).__FITFI_WC_CLIENT
    ) {
      this.client = (globalThis as any).__FITFI_WC_CLIENT;
      this._attachEventListeners();
      return;
    }

    this.client = await SignClient.init({
      projectId: PROJECT_ID,
      metadata: {
        name: 'FitFi',
        description: 'FitFi - Fitness meets DeFi',
        url: 'https://fitfi.app',
        icons: ['https://fitfi.app/logo.png'],
        redirect: {
          native: 'fitfimobileapp://',
          universal: 'https://fitfi.app',
        },
      },
    });

    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__FITFI_WC_CLIENT = this.client;
    }
    this._attachEventListeners();
  }

  private static _attachEventListeners() {
    if (this.listenersAttached || !this.client) return;
    this.client.on('session_delete', (e) => {
      if (this.DEV_LOG) console.log('[WalletAuth] session_delete', e);
      this.session = null;
    });
    this.client.on('session_event', (e) => {
      if (this.DEV_LOG) console.log('[WalletAuth] session_event', e);
    });
    this.client.on('session_update', (e) => {
      if (this.DEV_LOG) console.log('[WalletAuth] session_update', e);
    });
    this.client.core.pairing.events.on('pairing_delete', (e) => {
      if (this.DEV_LOG) console.log('[WalletAuth] pairing_delete', e);
    });
    this.listenersAttached = true;
  }

  private static async showWalletOptions(uri: string) {
    return new Promise<void>((resolve, reject) => {
      const metamaskDeeplink = this.createMetaMaskDeeplink(uri);
      const trustDeeplink = this.createTrustWalletDeeplink(uri);
      const rainbowDeeplink = this.createRainbowDeeplink(uri);

      Alert.alert(
        'Connect Your Wallet',
        'Choose a wallet to connect and sign in to FitFi',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () =>
              reject(new Error('User cancelled wallet connection')),
          },
          {
            text: '🦊 MetaMask',
            onPress: async () => {
              // Prefer universal link first for reliability
              this.lastWalletReopenUrl = metamaskDeeplink.universal;
              await this.openWalletWithFallback(metamaskDeeplink, 'MetaMask');
              resolve();
            },
          },
          {
            text: '👛 Trust Wallet',
            onPress: async () => {
              this.lastWalletReopenUrl = 'trust://';
              await this.openWalletWithFallback(trustDeeplink, 'Trust Wallet');
              resolve();
            },
          },
          {
            text: '🌈 Rainbow',
            onPress: async () => {
              this.lastWalletReopenUrl = 'rainbow://';
              await this.openWalletWithFallback(rainbowDeeplink, 'Rainbow');
              resolve();
            },
          },
        ]
      );
    });
  }

  private static createMetaMaskDeeplink(uri: string): {
    scheme: string;
    universal: string;
    storeUrl: string;
  } {
    return {
      scheme: `metamask://wc?uri=${encodeURIComponent(uri)}`,
      universal: `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
      storeUrl: 'https://play.google.com/store/apps/details?id=io.metamask',
    };
  }

  private static createTrustWalletDeeplink(uri: string): {
    scheme: string;
    universal: string;
    storeUrl: string;
  } {
    return {
      scheme: `trust://wc?uri=${encodeURIComponent(uri)}`,
      universal: `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`,
      storeUrl:
        'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
    };
  }

  private static createRainbowDeeplink(uri: string): {
    scheme: string;
    universal: string;
    storeUrl: string;
  } {
    return {
      scheme: `rainbow://wc?uri=${encodeURIComponent(uri)}`,
      universal: `https://rnbwapp.com/wc?uri=${encodeURIComponent(uri)}`,
      storeUrl: 'https://play.google.com/store/apps/details?id=me.rainbow',
    };
  }

  private static async openWalletWithFallback(
    deeplink: { scheme: string; universal: string; storeUrl: string },
    walletName: string
  ) {
    try {
      // Try universal link first (MetaMask recommends universal initially)
      const canOpenUniversal = await Linking.canOpenURL(deeplink.universal);
      if (canOpenUniversal) {
        await Linking.openURL(deeplink.universal);
        this.lastConnectDeepLinkUsed = deeplink.universal;
        return;
      }

      // Fallback to direct scheme
      const canOpenScheme = await Linking.canOpenURL(deeplink.scheme);
      if (canOpenScheme) {
        await Linking.openURL(deeplink.scheme);
        this.lastConnectDeepLinkUsed = deeplink.scheme;
        return;
      }

      // Wallet not installed - offer to install
      Alert.alert(
        `${walletName} Not Found`,
        `${walletName} is not installed on your device. Would you like to install it?`,
        [
          {
            text: 'Install',
            onPress: () => Linking.openURL(deeplink.storeUrl),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      throw new Error(`${walletName} not installed`);
    } catch (error) {
      console.error(`Failed to open ${walletName}:`, error);
      throw error;
    }
  }

  private static async openWalletApp() {
    const reopen = this.lastWalletReopenUrl || this.lastConnectDeepLinkUsed;
    if (reopen) {
      try {
        await Linking.openURL(reopen);
        // Give the wallet app time to open
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.log('Failed to reopen wallet app:', error);
      }
    }
  }

  /** Utility: timeout wrapper */
  private static async _awaitWithTimeout<T>(
    p: Promise<T>,
    ms: number,
    msg: string
  ): Promise<T> {
    let to: any;
    const timeout = new Promise<never>((_, reject) => {
      to = setTimeout(() => reject(new Error(msg)), ms);
    });
    try {
      const val = await Promise.race([p, timeout]);
      return val as T;
    } finally {
      clearTimeout(to);
    }
  }

  /** Force clear stale pairings (debug UI can call) */
  static async clearStalePairings() {
    try {
      if (!this.client) return;
      const pairings = this.client.core.pairing.pairings.getAll();
      for (const p of pairings) {
        try {
          await this.client.core.pairing.disconnect({ topic: p.topic });
        } catch {}
      }
      if (this.DEV_LOG) console.log('[WalletAuth] Cleared stale pairings');
    } catch (e) {
      console.log('[WalletAuth] clearStalePairings error', e);
    }
  }

  static async disconnect() {
    try {
      if (this.client && this.session) {
        await this.client.disconnect({
          topic: this.session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        });
      }
    } catch (error) {
      console.log('Disconnect error (non-critical):', error);
    } finally {
      this.session = null;
      this.lastWalletReopenUrl = null;
    }
  }

  static isConnected(): boolean {
    return !!this.session;
  }

  static getConnectedAddress(): string | null {
    try {
      const account = this.session?.namespaces?.eip155?.accounts?.[0];
      if (!account) return null;
      return account.split(':')[2]?.toLowerCase() || null;
    } catch {
      return null;
    }
  }

  static getChainId(): string | null {
    try {
      const account = this.session?.namespaces?.eip155?.accounts?.[0];
      if (!account) return null;
      const [namespace, chain] = account.split(':');
      return `${namespace}:${chain}`;
    } catch {
      return null;
    }
  }
}
