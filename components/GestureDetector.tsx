import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Hand, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { GestureType } from '@/types';
import Button from './Button';

type GestureDetectorProps = {
  onGestureDetected: (gesture: GestureType) => void;
  onHandDetected?: (detected: boolean) => void;
  isActive: boolean;
};

export default function GestureDetector({ onGestureDetected, onHandDetected, isActive }: GestureDetectorProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [detectedGesture, setDetectedGesture] = useState<GestureType>('none');
  const [handPresent, setHandPresent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  
  // Real-time gesture detection using AI
  useEffect(() => {
    if (!isActive || !permission?.granted) return;
    
    // Clear any existing interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    detectionInterval.current = setInterval(async () => {
      await captureAndAnalyzeFrame();
    }, 2000); // Analyze every 2 seconds
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [isActive, permission?.granted]);
  
  const captureAndAnalyzeFrame = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Take a picture from the camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: true,
        skipProcessing: true,
      });
      
      if (photo?.base64) {
        await analyzeGesture(photo.base64);
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const analyzeGesture = async (base64Image: string) => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a hand gesture recognition AI for a calling app. Analyze the image and detect:

1. Is there a hand visible? (yes/no)
2. What gesture is being made?

Gestures to detect:
- "call": pointing finger (index finger extended)
- "hangup": open palm (all fingers extended)
- "save": thumbs up
- "delete": closed fist
- "none": no clear gesture or no hand

Respond with JSON only: {"hand_detected": true/false, "gesture": "call|hangup|save|delete|none"}

Be strict - only detect clear, obvious gestures. If unsure, return "none".`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image for hand gestures:'
                },
                {
                  type: 'image',
                  image: base64Image
                }
              ]
            }
          ]
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        try {
          const gestureData = JSON.parse(result.completion);
          
          const handDetected = gestureData.hand_detected;
          const gesture = gestureData.gesture as GestureType;
          
          // Update hand detection state
          if (handDetected !== handPresent) {
            setHandPresent(handDetected);
            if (onHandDetected) {
              onHandDetected(handDetected);
            }
          }
          
          // Update gesture state
          setDetectedGesture(gesture);
          
          // Trigger gesture callback if valid gesture detected
          if (handDetected && gesture !== 'none') {
            onGestureDetected(gesture);
          }
          
        } catch (parseError) {
          console.error('Error parsing gesture analysis:', parseError);
        }
      }
    } catch (error) {
      console.error('Error analyzing gesture:', error);
    }
  };
  
  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };
  
  if (!permission) {
    return <View />;
  }
  
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          Camera permission is required for AI gesture detection
        </Text>
        <Button 
          title="Grant Permission" 
          onPress={handleRequestPermission} 
          variant="primary"
        />
      </View>
    );
  }
  
  if (!isActive) {
    return (
      <View style={[styles.inactiveContainer, { backgroundColor: colors.card }]}>
        <Eye size={24} color={colors.primary} />
        <Text style={[styles.inactiveText, { color: colors.text }]}>
          Show your hand to activate AI gestures
        </Text>
      </View>
    );
  }
  
  const getGestureDescription = (gesture: GestureType) => {
    switch (gesture) {
      case 'call': return '👉 Point to call';
      case 'hangup': return '✋ Palm to hang up';
      case 'save': return '👍 Thumbs up to save';
      case 'delete': return '✊ Fist to delete';
      default: return 'Make a gesture...';
    }
  };
  
  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.handIndicator, 
              { backgroundColor: handPresent ? colors.success : colors.error }
            ]}>
              <Hand size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
              {handPresent ? 'Hand Detected' : 'Show Your Hand'}
            </Text>
            
            {isProcessing && (
              <Text style={[styles.processingText, { color: colors.warning }]}>
                AI Analyzing...
              </Text>
            )}
          </View>
          
          {handPresent && (
            <Text style={[styles.gestureText, { color: '#FFFFFF' }]}>
              {getGestureDescription(detectedGesture)}
            </Text>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  handIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  processingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gestureText: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  inactiveContainer: {
    width: '100%',
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    flexDirection: 'row',
  },
  inactiveText: {
    fontSize: 16,
  },
});