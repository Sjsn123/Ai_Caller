import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
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
  const [isAlwaysListening, setIsAlwaysListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const listeningInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Configure audio mode and check permissions
  useEffect(() => {
    const configureAudio = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        }
      } catch (error) {
        console.error('Error configuring audio:', error);
        setHasPermission(false);
      }
    };
    
    configureAudio();
  }, []);
  
  // Always listen for trigger phrase "start call" only if permission is granted
  useEffect(() => {
    if (!isAlwaysListening || isActive || !hasPermission) return;
    
    const startTriggerListening = async () => {
      try {
        if (Platform.OS === 'web') {
          // Web implementation using MediaRecorder
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await processAudioForTrigger(audioBlob);
            stream.getTracks().forEach(track => track.stop());
          };
          
          mediaRecorder.start();
          
          // Record for 3 seconds, then process
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 3000);
          
        } else {
          // Mobile implementation using expo-av
          const { recording: newRecording } = await Audio.Recording.createAsync({
            android: {
              extension: '.m4a',
              outputFormat: Audio.AndroidOutputFormat.MPEG_4,
              audioEncoder: Audio.AndroidAudioEncoder.AAC,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
            },
            ios: {
              extension: '.wav',
              outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.HIGH,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
            web: {
              mimeType: 'audio/webm',
              bitsPerSecond: 128000,
            },
          });
          
          // Record for 3 seconds
          setTimeout(async () => {
            try {
              await newRecording.stopAndUnloadAsync();
              const uri = newRecording.getURI();
              if (uri) {
                await processAudioForTrigger(uri);
              }
            } catch (error) {
              console.error('Error stopping recording:', error);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Error starting trigger listening:', error);
        // Don't show error to user for background listening
      }
    };
    
    // Start listening every 4 seconds
    listeningInterval.current = setInterval(startTriggerListening, 4000);
    
    return () => {
      if (listeningInterval.current) {
        clearInterval(listeningInterval.current);
      }
    };
  }, [isAlwaysListening, isActive, hasPermission]);
  
  // Active voice command detection
  useEffect(() => {
    if (!isActive || !hasPermission) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    startActiveListening();
  }, [isActive, hasPermission]);
  
  const processAudioForTrigger = async (audioData: Blob | string) => {
    try {
      const formData = new FormData();
      
      if (typeof audioData === 'string') {
        // Mobile - file URI
        const uriParts = audioData.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri: audioData,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`
        } as any;
        
        formData.append('audio', audioFile);
      } else {
        // Web - Blob
        formData.append('audio', audioData, 'recording.wav');
      }
      
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        const text = result.text.toLowerCase();
        
        // Check for trigger phrases
        const triggerPhrases = ['start call', 'hey genie', 'voice command', 'call genie'];
        const foundTrigger = triggerPhrases.some(phrase => text.includes(phrase));
        
        if (foundTrigger) {
          setTranscript(`"${result.text}"`);
          if (onVoiceActivated) {
            onVoiceActivated(true);
          }
          
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          setTimeout(() => {
            setTranscript('');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error processing trigger audio:', error);
    }
  };
  
  const startActiveListening = async () => {
    if (!hasPermission) return;
    
    try {
      setIsProcessing(true);
      
      if (Platform.OS === 'web') {
        // Web implementation
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          await processVoiceCommand(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        // Record for 5 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 5000);
        
      } else {
        // Mobile implementation
        const { recording: newRecording } = await Audio.Recording.createAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        });
        
        setRecording(newRecording);
        
        // Record for 5 seconds
        setTimeout(async () => {
          try {
            await newRecording.stopAndUnloadAsync();
            const uri = newRecording.getURI();
            if (uri) {
              await processVoiceCommand(uri);
            }
            setRecording(null);
          } catch (error) {
            console.error('Error stopping recording:', error);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error starting active listening:', error);
      setIsProcessing(false);
    }
  };
  
  const processVoiceCommand = async (audioData: Blob | string) => {
    try {
      // First, transcribe the audio
      const formData = new FormData();
      
      if (typeof audioData === 'string') {
        // Mobile - file URI
        const uriParts = audioData.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri: audioData,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`
        } as any;
        
        formData.append('audio', audioFile);
      } else {
        // Web - Blob
        formData.append('audio', audioData, 'recording.wav');
      }
      
      const sttResponse = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (sttResponse.ok) {
        const sttResult = await sttResponse.json();
        const transcribedText = sttResult.text;
        
        setTranscript(`"${transcribedText}"`);
        
        // Now process the command using AI
        const aiResponse = await fetch('https://toolkit.rork.com/text/llm/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are a voice command processor for a calling app. Analyze the user's speech and extract:
1. Command type: "call", "save", "delete", "block", or "none"
2. Parameters: contact name, phone number, or other relevant info

Respond with JSON only: {"command": "call|save|delete|block|none", "params": "extracted info or empty string"}

Examples:
- "Call John" -> {"command": "call", "params": "John"}
- "Call 555-1234" -> {"command": "call", "params": "555-1234"}
- "Save this contact" -> {"command": "save", "params": ""}
- "Save contact as Mom" -> {"command": "save", "params": "Mom"}
- "Delete this number" -> {"command": "delete", "params": ""}
- "Block this caller" -> {"command": "block", "params": ""}`
              },
              {
                role: 'user',
                content: transcribedText
              }
            ]
          })
        });
        
        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          try {
            const commandData = JSON.parse(aiResult.completion);
            
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            onCommandDetected(
              commandData.command as VoiceCommand,
              commandData.params || undefined
            );
            
            // Auto-disable after command
            setTimeout(() => {
              setTranscript('');
              onToggle();
            }, 3000);
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggle();
  };
  
  const handleToggleAlwaysListening = () => {
    if (!hasPermission) {
      if (Platform.OS === 'web') {
        alert('Microphone permission is required for voice commands');
      } else {
        Alert.alert('Permission Required', 'Microphone permission is required for voice commands');
      }
      return;
    }
    
    setIsAlwaysListening(!isAlwaysListening);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const getCommandDescription = () => {
    if (!hasPermission) {
      return 'Microphone permission required';
    }
    
    if (isActive) {
      return isProcessing ? 'Processing...' : 'Try: "Call John", "Save contact", "Delete number"';
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
            {transcript}
          </Text>
        </View>
      )}
      
      {isActive && !transcript && !isProcessing && (
        <View style={[styles.listeningContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.listeningText, { color: colors.subtext }]}>
            Listening for commands...
          </Text>
        </View>
      )}
      
      {isProcessing && (
        <View style={[styles.processingContainer, { backgroundColor: colors.primary }]}>
          <Text style={[styles.processingText, { color: '#FFFFFF' }]}>
            Processing voice command...
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
  processingContainer: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  processingText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
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