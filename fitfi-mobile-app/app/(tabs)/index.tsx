import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'active-duels') iconName = 'flash';
          else if (route.name === 'previous-duels') iconName = 'time';
          else if (route.name === 'settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name='home' options={{ title: 'Home' }} />
      <Tabs.Screen name='active-duels' options={{ title: 'Active Duels' }} />
      <Tabs.Screen
        name='previous-duels'
        options={{ title: 'Previous Duels' }}
      />
      <Tabs.Screen name='settings' options={{ title: 'Settings' }} />
    </Tabs>
  );
}
