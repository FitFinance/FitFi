import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/styles/GlobalStyles';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.dark.primary,
          tabBarInactiveTintColor: Colors.dark.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: Colors.dark.surface,
            borderTopColor: Colors.dark.border,
            borderTopWidth: 1,
            paddingTop: 8,
            height: Platform.select({
              ios: 90, // Extra height for iOS home indicator
              android: 70,
              default: 70,
            }),
            paddingBottom: Platform.select({
              ios: 34, // Safe area padding for iOS home indicator
              android: 8,
              default: 8,
            }),
            ...Platform.select({
              ios: {
                position: 'absolute',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                elevation: 8,
              },
              default: {},
            }),
          },
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name='house.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='home'
          options={{
            href: null, // Hide this duplicate tab
          }}
        />
        <Tabs.Screen
          name='active-duels'
          options={{
            title: 'Active',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name='flame.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='previous-duels'
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name='clock.fill' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='settings'
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name='gear' color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='explore'
          options={{
            href: null, // Hide this tab
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
