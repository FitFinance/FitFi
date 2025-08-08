import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeStyles } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../utils/ApiService';
import NetworkTestScreen from './NetworkTestScreen';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, setTheme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoJoinDuels, setAutoJoinDuels] = useState(false);
  const [shareActivity, setShareActivity] = useState(true);
  const [showNetworkTest, setShowNetworkTest] = useState(false);

  // Theme-aware styles
  const styles = useThemeStyles(lightStyles, darkStyles);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear all stored auth data
            await AsyncStorage.multiRemove([
              'userToken',
              'walletAddress',
              'userEmail',
              'userData',
            ]);

            // Clear token from API service
            apiService.setAuthToken(null);

            // Navigate back to login
            router.replace('/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const SettingItem = ({ title, subtitle, children, showBorder = true }) => (
    <View style={[styles.settingItem, !showBorder && styles.noBorder]}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  // Dark mode selection component
  const ThemeSelector = () => (
    <View style={styles.themeSelector}>
      {[
        { key: 'light', label: '☀️ Light', value: 'light' },
        { key: 'dark', label: '🌙 Dark', value: 'dark' },
        { key: 'system', label: '📱 System', value: 'system' },
      ].map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.themeOption,
            theme === option.value && styles.themeOptionActive,
          ]}
          onPress={() => setTheme(option.value as any)}
        >
          <Text
            style={[
              styles.themeOptionText,
              theme === option.value && styles.themeOptionTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.subtitle}>Customize your FitFi experience</Text>
      </View>

      <SettingSection title='Notifications'>
        <SettingItem
          title='Push Notifications'
          subtitle='Get notified about duels, challenges, and rewards'
        >
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: isDark ? '#374151' : '#e5e7eb',
              true: '#10b981',
            }}
            thumbColor={
              notifications ? '#ffffff' : isDark ? '#9ca3af' : '#f3f4f6'
            }
          />
        </SettingItem>
        <SettingItem
          title='Activity Reminders'
          subtitle='Daily reminders to stay active'
          showBorder={false}
        >
          <Switch
            value={shareActivity}
            onValueChange={setShareActivity}
            trackColor={{
              false: isDark ? '#374151' : '#e5e7eb',
              true: '#10b981',
            }}
            thumbColor={
              shareActivity ? '#ffffff' : isDark ? '#9ca3af' : '#f3f4f6'
            }
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title='Appearance'>
        <SettingItem
          title='Theme'
          subtitle={`Current: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
          showBorder={false}
        >
          <View />
        </SettingItem>
        <ThemeSelector />
      </SettingSection>

      <SettingSection title='Duels & Challenges'>
        <SettingItem
          title='Auto-join Duels'
          subtitle='Automatically join matching duels'
          showBorder={false}
        >
          <Switch
            value={autoJoinDuels}
            onValueChange={setAutoJoinDuels}
            trackColor={{
              false: isDark ? '#374151' : '#e5e7eb',
              true: '#10b981',
            }}
            thumbColor={
              autoJoinDuels ? '#ffffff' : isDark ? '#9ca3af' : '#f3f4f6'
            }
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title='Account'>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            🔗 Connect Fitness Tracker
          </Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💰 Wallet Settings</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📊 Export Data</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderBottomWidth: 0 }]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
            🚪 Logout
          </Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
      </SettingSection>

      <SettingSection title='Support'>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>❓ Help & FAQ</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📧 Contact Support</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>⭐ Rate App</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
      </SettingSection>

      <View style={styles.footer}>
        <Text style={styles.versionText}>FitFi v1.0.0</Text>
        <Text style={styles.copyrightText}>
          © 2025 FitFi. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  settingControl: {
    marginLeft: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  themeOptionTextActive: {
    color: '#1e293b',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionButtonArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  settingControl: {
    marginLeft: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 4,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  themeOptionTextActive: {
    color: '#f1f5f9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '500',
  },
  actionButtonArrow: {
    fontSize: 16,
    color: '#94a3b8',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
