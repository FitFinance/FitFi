import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='duel-details' options={{ title: 'Duel Details' }} />
      <Stack.Screen name='user-settings' options={{ title: 'User Settings' }} />
      <Stack.Screen
        name='connect-wallet'
        options={{ title: 'Connect Wallet' }}
      />
      <Stack.Screen name='splash' options={{ headerShown: false }} />
    </Stack>
  );
}
