import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { 
  Phone, 
  MicOff, 
  Mic, 
  Volume2, 
  VolumeX,
  UserPlus,
  Hand
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import GestureDetector from './GestureDetector';
import { GestureType } from '@/types';

type CallScreenProps = {
  name: string;
  phoneNumber: string;
  photoUrl?: string;
  onHangup: () => void;
  onAddContact?: () => void;
};

export default function CallScreen({ 
  name, 
  phoneNumber, 
  photoUrl,
  onHangup,
  onAddContact
}: CallScreenProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop';
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  const toggleMute = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsMuted(!isMuted);
  };
  
  const toggleSpeaker = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSpeaker(!isSpeaker);
  };
  
  const handleHangup = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    onHangup();
  };
  
  const handleGestureDetected = (gesture: GestureType) => {
    if (gesture === 'hangup') {
      handleHangup();
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.callerInfo}>
        <Image
          source={{ uri: photoUrl || defaultAvatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        
        <Text style={[styles.name, { color: colors.text }]}>
          {name || 'Unknown'}
        </Text>
        
        <Text style={[styles.phoneNumber, { color: colors.subtext }]}>
          {phoneNumber}
        </Text>
        
        <Text style={[styles.duration, { color: colors.primary }]}>
          {formatDuration(callDuration)}
        </Text>
      </View>
      
      {!name && (
        <TouchableOpacity 
          style={[styles.addContact, { backgroundColor: colors.card }]}
          onPress={onAddContact}
        >
          <UserPlus size={20} color={colors.primary} />
          <Text style={[styles.addContactText, { color: colors.primary }]}>
            Add to contacts
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.gestureContainer}>
        <TouchableOpacity 
          style={[
            styles.gestureToggle, 
            { backgroundColor: isGestureActive ? colors.primary : colors.card }
          ]}
          onPress={() => setIsGestureActive(!isGestureActive)}
        >
          <Hand size={20} color={isGestureActive ? '#FFFFFF' : colors.subtext} />
          <Text style={[
            styles.gestureText, 
            { color: isGestureActive ? '#FFFFFF' : colors.subtext }
          ]}>
            {isGestureActive ? 'Gesture Active' : 'Enable Gestures'}
          </Text>
        </TouchableOpacity>
        
        {isGestureActive && (
          <GestureDetector 
            isActive={isGestureActive}
            onGestureDetected={handleGestureDetected}
          />
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} color={colors.error} />
          ) : (
            <Mic size={24} color={colors.text} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.hangupButton, { backgroundColor: colors.error }]}
          onPress={handleHangup}
        >
          <Phone size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={toggleSpeaker}
        >
          {isSpeaker ? (
            <Volume2 size={24} color={colors.primary} />
          ) : (
            <VolumeX size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 16,
  },
  duration: {
    fontSize: 20,
    fontWeight: '500',
  },
  addContact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addContactText: {
    fontSize: 16,
    fontWeight: '500',
  },
  gestureContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  gestureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  gestureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hangupButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});