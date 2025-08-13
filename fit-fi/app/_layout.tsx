// Reanimated import must be at the top before other imports (except react if used)
import 'react-native-reanimated';
import '../polyfills';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { reopenLastWalletConnectURI } from '@/services/WalletService';

import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/styles/GlobalStyles';

export default function RootLayout() {
  useRouter(); // invoked to ensure router prep (unused directly)
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Deep link handler (wallet returning)
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      // If we already have an authenticated user do nothing
      // Else attempt a lightweight session resume & trigger sign if not authenticated
      // (Connect + sign are coupled currently; we can add smarter logic later.)
      // For now, simply log and try to reopen WC URI if still waiting.
      console.log('[Linking] Received URL', event.url);
      // Optionally could route somewhere based on path (not needed yet)
      // If user is stuck without prompt, re-open URI
      reopenLastWalletConnectURI();
    };
    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });
    return () => sub.remove();
  }, []);

  if (!loaded) {
    return <SafeAreaProvider />; // maintain hook order and minimal placeholder
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
              <Stack>
                <Stack.Screen name='splash' options={{ headerShown: false }} />
                <Stack.Screen name='login' options={{ headerShown: false }} />
                <Stack.Screen
                  name='connect-wallet'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='profile-setup'
                  options={{ headerShown: false }}
                />
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen
                  name='user-settings'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='duel-details'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='duel-health-monitor'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='network-test'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='challenges'
                  options={{ headerShown: false }}
                />
                <Stack.Screen name='+not-found' />
              </Stack>
            </View>
            <StatusBar style='light' backgroundColor={Colors.dark.background} />
          </SafeAreaView>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
  },
});
