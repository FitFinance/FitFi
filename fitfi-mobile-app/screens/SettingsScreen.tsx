import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoJoinDuels, setAutoJoinDuels] = useState(false);
  const [shareActivity, setShareActivity] = useState(true);

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
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor={notifications ? '#ffffff' : '#f3f4f6'}
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
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor={shareActivity ? '#ffffff' : '#f3f4f6'}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title='Appearance'>
        <SettingItem
          title='Dark Mode'
          subtitle='Switch to dark theme'
          showBorder={false}
        >
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
          />
        </SettingItem>
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
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor={autoJoinDuels ? '#ffffff' : '#f3f4f6'}
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

const styles = StyleSheet.create({
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
