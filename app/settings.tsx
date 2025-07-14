import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Hand, 
  Mic, 
  Bell, 
  Shield, 
  HelpCircle,
  ChevronRight
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

export default function SettingsDetailScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  
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
      <Stack.Screen options={{ title: "Settings" }} />
      
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
      
      <View style={styles.aboutSection}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>
          About CallGenie
        </Text>
        <Text style={[styles.aboutText, { color: colors.subtext }]}>
          CallGenie is an AI-powered smart calling application that uses gesture recognition, 
          voice commands, and facial recognition to provide a seamless calling experience.
        </Text>
        <Text style={[styles.versionText, { color: colors.subtext }]}>
          Version 1.0.0
        </Text>
      </View>
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
  aboutSection: {
    marginTop: 40,
    padding: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
  },
});