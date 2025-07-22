import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Hand, Mic } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useCallLogsStore } from '@/store/call-logs-store';
import { useContactsStore } from '@/store/contacts-store';
import DialPad from '@/components/DialPad';
import GestureDetector from '@/components/GestureDetector';
import VoiceCommandListener from '@/components/VoiceCommandListener';
import FloatingButton from '@/components/FloatingButton';
import FloatingStars from '@/components/FloatingStars';
import { GestureType, VoiceCommand } from '@/types';
import * as Haptics from 'expo-haptics';

export default function DialerScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { addCallLog, callLogs } = useCallLogsStore();
  const { contacts, addContact } = useContactsStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const handleCall = (number: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Find contact if exists
    const contact = contacts.find(c => c.phoneNumber === number);
    
    // Add to call logs
    const callLog = {
      id: Date.now().toString(),
      contactId: contact?.id,
      name: contact?.name,
      phoneNumber: number,
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300), // Random duration for demo
      type: 'outgoing' as const,
    };
    
    addCallLog(callLog);
    
    // Navigate to call screen
    router.push({
      pathname: '/call',
      params: { 
        number,
        name: contact?.name || '',
        photo: contact?.photoUrl || '',
      }
    });
  };
  
  const handleSaveContact = (numberToSave?: string) => {
    let contactNumber = numberToSave;
    let contactName = '';
    
    // If no specific number provided, try to save current dialed number or most recent call
    if (!contactNumber) {
      if (phoneNumber) {
        // Save currently dialed number
        contactNumber = phoneNumber;
        contactName = `Contact ${phoneNumber}`;
      } else if (callLogs.length > 0) {
        // Save most recent call
        const recentCall = callLogs[0];
        contactNumber = recentCall.phoneNumber;
        contactName = recentCall.name || `Contact ${recentCall.phoneNumber}`;
      }
    }
    
    if (!contactNumber) {
      if (Platform.OS === 'web') {
        alert('No number to save. Dial a number or make a call first.');
      } else {
        Alert.alert('No Number', 'No number to save. Dial a number or make a call first.');
      }
      return;
    }
    
    // Check if contact already exists
    const existingContact = contacts.find(c => c.phoneNumber === contactNumber);
    if (existingContact) {
      if (Platform.OS === 'web') {
        alert(`${contactNumber} is already in your contacts as ${existingContact.name}`);
      } else {
        Alert.alert('Contact Exists', `${contactNumber} is already in your contacts as ${existingContact.name}`);
      }
      return;
    }
    
    // Navigate to new contact screen with pre-filled number
    router.push({
      pathname: '/contact/new',
      params: { 
        number: contactNumber,
        suggestedName: contactName
      }
    });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleDeleteNumber = () => {
    if (phoneNumber) {
      setPhoneNumber('');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else if (callLogs.length > 0) {
      // Could implement delete recent call here
      if (Platform.OS === 'web') {
        alert('Recent call would be deleted (demo)');
      } else {
        Alert.alert('Delete', 'Recent call would be deleted (demo)');
      }
    }
  };
  
  const handleGestureDetected = (gesture: GestureType) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    switch (gesture) {
      case 'call':
        if (phoneNumber) {
          handleCall(phoneNumber);
        }
        break;
      case 'save':
        handleSaveContact();
        break;
      case 'delete':
        handleDeleteNumber();
        break;
      case 'hangup':
        // Could implement hangup logic here
        break;
    }
  };
  
  const handleHandDetected = (detected: boolean) => {
    // Automatically activate gesture mode when hand is detected
    if (detected && !isGestureActive) {
      setIsGestureActive(true);
      if (isVoiceActive) setIsVoiceActive(false); // Disable voice when gesture is active
    }
    // Keep gesture active even when hand is not detected to avoid flickering
  };
  
  const handleVoiceActivated = (activated: boolean) => {
    // Automatically activate voice mode when trigger phrase is detected
    if (activated && !isVoiceActive) {
      setIsVoiceActive(true);
      if (isGestureActive) setIsGestureActive(false); // Disable gesture when voice is active
    }
  };
  
  const handleVoiceCommand = (command: VoiceCommand, params?: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    switch (command) {
      case 'call':
        if (params) {
          // Find contact by name
          const contact = contacts.find(c => 
            c.name.toLowerCase().includes(params.toLowerCase())
          );
          
          if (contact) {
            handleCall(contact.phoneNumber);
          } else {
            // If it's a number
            if (/^\d+$/.test(params)) {
              handleCall(params);
            }
          }
        } else if (phoneNumber) {
          handleCall(phoneNumber);
        }
        break;
      case 'save':
        handleSaveContact(params); // params could be a specific number
        break;
      case 'delete':
        handleDeleteNumber();
        break;
      case 'block':
        // Could implement block functionality
        if (Platform.OS === 'web') {
          alert('Block functionality would be implemented here');
        } else {
          Alert.alert('Block', 'Block functionality would be implemented here');
        }
        break;
    }
  };
  
  const handleManualGestureToggle = () => {
    setIsGestureActive(!isGestureActive);
    setIsCameraActive(!isCameraActive);
    if (!isGestureActive && isVoiceActive) setIsVoiceActive(false);
  };
  
  const handleManualVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive && isGestureActive) {
      setIsGestureActive(false);
      setIsCameraActive(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FloatingStars />
      
      <View style={styles.topControls}>
        <View style={styles.controlGroup}>
          <FloatingButton
            onPress={handleManualGestureToggle}
            variant={isGestureActive ? 'primary' : 'secondary'}
            size="medium"
          >
            <Hand size={20} color="#FFFFFF" />
          </FloatingButton>
          
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            {isGestureActive ? 'Gestures Active' : 'Enable Gestures'}
          </Text>
        </View>
        
        <View style={styles.controlGroup}>
          <FloatingButton
            onPress={handleManualVoiceToggle}
            variant={isVoiceActive ? 'accent' : 'secondary'}
            size="medium"
          >
            <Mic size={20} color="#FFFFFF" />
          </FloatingButton>
          
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            {isVoiceActive ? 'Voice Active' : 'Enable Voice'}
          </Text>
        </View>
      </View>
      
      {isGestureActive && (
        <View style={styles.gestureContainer}>
          <GestureDetector 
            isActive={isCameraActive}
            onGestureDetected={handleGestureDetected}
            onHandDetected={handleHandDetected}
          />
        </View>
      )}
      
      <View style={styles.dialpadContainer}>
        <DialPad 
          value={phoneNumber}
          onChange={setPhoneNumber}
          onCall={handleCall}
        />
      </View>
      
      {isVoiceActive && (
        <View style={styles.voiceContainer}>
          <VoiceCommandListener 
            isActive={isVoiceActive}
            onCommandDetected={handleVoiceCommand}
            onVoiceActivated={handleVoiceActivated}
            onToggle={handleManualVoiceToggle}
          />
        </View>
      )}
      
      <View style={styles.hintsContainer}>
        <Text style={[styles.hintsTitle, { color: colors.text }]}>Quick Actions:</Text>
        <Text style={[styles.hintsText, { color: colors.subtext }]}>
          Thumbs up or say "save contact" to save number
        </Text>
        <Text style={[styles.hintsText, { color: colors.subtext }]}>
          Fist or say "delete" to clear number
        </Text>
        <Text style={[styles.hintsText, { color: colors.subtext }]}>
          Point or say "call [name]" to make a call
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  gestureContainer: {
    marginBottom: 16,
  },
  dialpadContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  voiceContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  hintsContainer: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hintsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});