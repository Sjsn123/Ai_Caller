import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { VoiceCommand } from '@/types';
import * as Haptics from 'expo-haptics';

type VoiceCommandListenerProps = {
  onCommandDetected: (command: VoiceCommand, params?: string) => void;
  onVoiceActivated?: (activated: boolean) => void;
  isActive: boolean;
  onToggle: () => void;
};

export default function VoiceCommandListener({ 
  onCommandDetected, 
  onVoiceActivated,
  isActive,
  onToggle
}: VoiceCommandListenerProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAlwaysListening, setIsAlwaysListening] = useState(true);
  const listeningInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Always listen for trigger phrase "start call"
  useEffect(() => {
    if (!isAlwaysListening) return;
    
    // Clear any existing interval
    if (listeningInterval.current) {
      clearInterval(listeningInterval.current);
      listeningInterval.current = null;
    }
    
    listeningInterval.current = setInterval(() => {
      // Simulate listening for trigger phrase
      const triggerPhrases = ['start call', 'hey genie', 'voice command'];
      const randomPhrase = Math.random() > 0.9 ? // 10% chance
        triggerPhrases[Math.floor(Math.random() * triggerPhrases.length)] : '';
      
      if (randomPhrase && !isActive) {
        setTranscript(`"${randomPhrase}"`);
        if (onVoiceActivated) {
          onVoiceActivated(true);
        }
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Clear transcript after showing trigger
        setTimeout(() => {
          setTranscript('');
        }, 2000);
      }
    }, 2000);
    
    return () => {
      if (listeningInterval.current) {
        clearInterval(listeningInterval.current);
        listeningInterval.current = null;
      }
    };
  }, [isAlwaysListening, isActive, onVoiceActivated]);
  
  // Active voice command detection
  useEffect(() => {
    if (!isActive) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    
    // Simulate voice command detection when active
    const timeout = setTimeout(() => {
      const commands = [
        { command: 'call', text: "Call John", params: 'John' },
        { command: 'call', text: "Call 555-1234", params: '555-1234' },
        { command: 'save', text: "Save this contact" },
        { command: 'save', text: "Save contact", params: '' },
        { command: 'delete', text: "Delete this number" },
        { command: 'block', text: "Block this caller" },
      ];
      
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setTranscript(randomCommand.text);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      onCommandDetected(
        randomCommand.command as VoiceCommand, 
        randomCommand.params
      );
      
      // Reset after a delay
      setTimeout(() => {
        setTranscript('');
        onToggle(); // Auto-disable after command
      }, 3000);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [isActive, onCommandDetected, onToggle]);
  
  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggle();
  };
  
  const handleToggleAlwaysListening = () => {
    setIsAlwaysListening(!isAlwaysListening);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const getCommandDescription = () => {
    if (isActive) {
      return 'Try: "Call John", "Save contact", "Delete number"';
    }
    return isAlwaysListening ? 'Say "start call" to activate' : 'Always listening disabled';
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: isActive ? colors.primary : colors.card }
          ]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          {isActive ? (
            <Mic size={24} color="#FFFFFF" />
          ) : (
            <MicOff size={24} color={colors.subtext} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.alwaysListenButton,
            { backgroundColor: isAlwaysListening ? colors.accent : colors.card }
          ]}
          onPress={handleToggleAlwaysListening}
          activeOpacity={0.8}
        >
          <Volume2 size={20} color={isAlwaysListening ? "#FFFFFF" : colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.statusText, { color: colors.subtext }]}>
        {getCommandDescription()}
      </Text>
      
      {isActive && transcript && (
        <View style={[styles.transcriptContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.transcript, { color: colors.text }]}>
            "{transcript}"
          </Text>
        </View>
      )}
      
      {isActive && !transcript && (
        <View style={[styles.listeningContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.listeningText, { color: colors.subtext }]}>
            Listening for commands...
          </Text>
        </View>
      )}
      
      {!isActive && transcript && (
        <View style={[styles.triggerContainer, { backgroundColor: colors.success }]}>
          <Text style={[styles.triggerText, { color: '#FFFFFF' }]}>
            Trigger detected: {transcript}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alwaysListenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  transcriptContainer: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  transcript: {
    fontSize: 16,
    textAlign: 'center',
  },
  listeningContainer: {
    padding: 8,
    borderRadius: 16,
  },
  listeningText: {
    fontSize: 14,
  },
  triggerContainer: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  triggerText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});