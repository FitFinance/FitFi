// Reanimated import must be at the top before other imports (except react if used)
import 'react-native-reanimated';
import '../polyfills';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/styles/GlobalStyles';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
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
