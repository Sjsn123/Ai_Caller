import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Hand,
  Mic,
  Bell,
  Shield,
  HelpCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useUserStore } from '@/store/user-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeStore();
  const colors = Colors[theme];
  const { user, logout } = useUserStore();
  
  const handleThemeToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    logout();
    router.replace('/(auth)');
  };
  
  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    rightElement,
    onPress
  }: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.background }]}>
        {icon}
      </View>
      
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.subtext }]}>
            {description}
          </Text>
        )}
      </View>
      
      {rightElement || (
        onPress && <ChevronRight size={20} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: user?.photoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop' }}
          style={styles.profileImage}
          contentFit="cover"
        />
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.subtext }]}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Appearance
      </Text>
      
      <SettingItem
        icon={theme === 'dark' ? 
          <Moon size={20} color={colors.primary} /> : 
          <Sun size={20} color={colors.warning} />
        }
        title="Dark Mode"
        description="Toggle between light and dark theme"
        rightElement={
          <Switch
            value={theme === 'dark'}
            onValueChange={handleThemeToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        }
      />
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Controls
      </Text>
      
      <SettingItem
        icon={<Hand size={20} color={colors.secondary} />}
        title="Gesture Controls"
        description="Configure gesture sensitivity and actions"
        onPress={() => {}}
      />
      
      <SettingItem
        icon={<Mic size={20} color={colors.accent} />}
        title="Voice Commands"
        description="Manage voice recognition settings"
        onPress={() => {}}
      />
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        App Settings
      </Text>
      
      <SettingItem
        icon={<Bell size={20} color={colors.warning} />}
        title="Notifications"
        description="Manage call and message alerts"
        onPress={() => {}}
      />
      
      <SettingItem
        icon={<Shield size={20} color={colors.success} />}
        title="Privacy & Security"
        description="Control app permissions and data"
        onPress={() => {}}
      />
      
      <SettingItem
        icon={<HelpCircle size={20} color={colors.primary} />}
        title="Help & Support"
        description="FAQs and contact information"
        onPress={() => {}}
      />
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={[styles.versionText, { color: colors.subtext }]}>
        CallGenie v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});