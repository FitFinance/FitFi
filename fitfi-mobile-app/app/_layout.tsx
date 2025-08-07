import '../polyfills';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeManager from '../components/ThemeManager';
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemeManager>
        <Stack>
          <Stack.Screen name='login' options={{ headerShown: false }} />
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen
            name='duel-details'
            options={{ title: 'Duel Details' }}
          />
          <Stack.Screen
            name='user-settings'
            options={{ title: 'User Settings' }}
          />
          <Stack.Screen
            name='connect-wallet'
            options={{ title: 'Connect Wallet' }}
          />
          <Stack.Screen name='splash' options={{ headerShown: false }} />
        </Stack>
      </ThemeManager>
    </ThemeProvider>
  );
}
