import React, { useEffect } from 'react';
import { StyleSheet, View, BackHandler, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useContactsStore } from '@/store/contacts-store';
import { useCallLogsStore } from '@/store/call-logs-store';
import CallScreen from '@/components/CallScreen';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

export default function CallPage() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { number, name, photo } = useLocalSearchParams<{ 
    number: string;
    name?: string;
    photo?: string;
  }>();
  const { contacts } = useContactsStore();
  const { addCallLog } = useCallLogsStore();
  
  // Handle back button on Android to prevent accidental call ending
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );
      
      return () => backHandler.remove();
    }
  }, []);
  
  const handleHangup = () => {
    // Add to call logs if not already added
    const callLog = {
      id: Date.now().toString(),
      contactId: contacts.find(c => c.phoneNumber === number)?.id,
      name: name || contacts.find(c => c.phoneNumber === number)?.name,
      phoneNumber: number || '',
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300), // Random duration for demo
      type: 'outgoing' as const,
    };
    
    addCallLog(callLog);
    
    router.back();
  };
  
  const handleAddContact = () => {
    router.push({
      pathname: '/contact/new',
      params: { number }
    });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CallScreen
        name={name || ''}
        phoneNumber={number || ''}
        photoUrl={photo}
        onHangup={handleHangup}
        onAddContact={handleAddContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});