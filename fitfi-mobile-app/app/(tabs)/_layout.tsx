import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'home';
          if (route.name === 'active-duels')
            iconName = focused ? 'flash' : 'flash-outline';
          else if (route.name === 'previous-duels')
            iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'settings')
            iconName = focused ? 'settings' : 'settings-outline';
          else if (route.name === 'home')
            iconName = focused ? 'home' : 'home-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 10,
          paddingBottom: 8,
          paddingTop: 8,
          minHeight: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name='active-duels'
        options={{
          title: 'Active Duels',
          tabBarLabel: 'Active',
        }}
      />
      <Tabs.Screen
        name='previous-duels'
        options={{
          title: 'Previous Duels',
          tabBarLabel: 'History',
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}
