import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '@/styles/GlobalStyles';

export default function SettingsScreen() {
  const router = useRouter();

  // Preference states
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [autoJoin, setAutoJoin] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to reconnect your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Clear storage and navigate to login
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in a future update.');
  };

  const handleConnectTracker = () => {
    Alert.alert('Connect Fitness Tracker', 'This feature will be available in a future update.');
  };

  const handleWalletSettings = () => {
    Alert.alert('Wallet Settings', 'This feature will be available in a future update.');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support at support@fitfi.app');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'This feature will be available in a future update.');
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'This feature will be available in a future update.');
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showArrow = true 
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && onPress && <Text style={styles.arrow}>→</Text>)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={GlobalStyles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your FitFi experience</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AF</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>Alex Fitness</Text>
              <Text style={styles.profileAddress}>0x1234...5678</Text>
              <Text style={styles.profileLevel}>Level 12 • 1,250 FF</Text>
            </View>
          </View>
          <TouchableOpacity
            style={GlobalStyles.buttonSecondary}
            onPress={() => router.push('/user-settings')}
          >
            <Text style={GlobalStyles.buttonText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingRow
            title="Push Notifications"
            subtitle="Get notified about duels and challenges"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
          
          <SettingRow
            title="Fitness Reminders"
            subtitle="Daily reminders to stay active"
            rightElement={
              <Switch
                value={reminders}
                onValueChange={setReminders}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
          
          <SettingRow
            title="Auto-join Challenges"
            subtitle="Automatically join matching challenges"
            rightElement={
              <Switch
                value={autoJoin}
                onValueChange={setAutoJoin}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
          
          <SettingRow
            title="Data Sync"
            subtitle="Sync fitness data across devices"
            rightElement={
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
        </View>

        {/* Theme Selection */}
        <SectionHeader title="Appearance" />
        <View style={styles.section}>
          <SettingRow
            title="Theme"
            subtitle="Dark mode (forced for demo)"
            rightElement={<Text style={styles.themeValue}>Dark</Text>}
            showArrow={false}
          />
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingRow
            title="Connect Fitness Tracker"
            subtitle="Link your wearable device"
            onPress={handleConnectTracker}
          />
          
          <SettingRow
            title="Wallet Settings"
            subtitle="Manage your connected wallet"
            onPress={handleWalletSettings}
          />
          
          <SettingRow
            title="Export Data"
            subtitle="Download your fitness data"
            onPress={handleExportData}
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support & Legal" />
        <View style={styles.section}>
          <SettingRow
            title="Help & Support"
            subtitle="Get help with FitFi"
            onPress={handleSupport}
          />
          
          <SettingRow
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacy}
          />
          
          <SettingRow
            title="Terms of Service"
            subtitle="FitFi terms and conditions"
            onPress={handleTerms}
          />
        </View>

        {/* Debug Section (Dev Only) */}
        {__DEV__ && (
          <>
            <SectionHeader title="Developer" />
            <View style={styles.section}>
              <SettingRow
                title="Network Test"
                subtitle="Test network connectivity"
                onPress={() => router.push('/network-test')}
              />
            </View>
          </>
        )}

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[GlobalStyles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[GlobalStyles.buttonTextPrimary, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>FitFi v1.0.0</Text>
          <Text style={styles.buildInfo}>Build 1234 • Dark Mode</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  scrollContainer: {
    padding: 16,
  },
  profileSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 8,
  },
  section: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 18,
    color: Colors.dark.textMuted,
  },
  themeValue: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: Colors.dark.error,
  },
  logoutText: {
    color: '#FFFFFF',
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  buildInfo: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
};
