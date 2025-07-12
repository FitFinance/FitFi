import React, { useEffect, useState } from 'react';
import SplashScreen from './screens/SplashScreen';
import ConnectWalletScreen from './screens/ConnectWalletScreen';
import AppNavigator from './navigation/AppNavigator';
import DuelDetailsScreen from './screens/DuelDetailsScreen';
import UserSettingsScreen from './screens/UserSettingsScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500); // Simulate splash
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!walletConnected ? (
        <Stack.Screen name='ConnectWallet' component={ConnectWalletScreen} />
      ) : (
        <>
          <Stack.Screen name='Main' component={AppNavigator} />
          <Stack.Screen name='DuelDetails' component={DuelDetailsScreen} />
          <Stack.Screen name='UserSettings' component={UserSettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
