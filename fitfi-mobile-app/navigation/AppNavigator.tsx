import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ActiveDuelsScreen from '../screens/ActiveDuelsScreen';
import PreviousDuelsScreen from '../screens/PreviousDuelsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName='Home'>
        <Tab.Screen name='Home' component={HomeScreen} />
        <Tab.Screen name='Active Duels' component={ActiveDuelsScreen} />
        <Tab.Screen name='Previous Duels' component={PreviousDuelsScreen} />
        <Tab.Screen name='Settings' component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
