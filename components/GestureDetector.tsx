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
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Simulate hand detection and gesture recognition
  useEffect(() => {
    if (!isActive || !permission?.granted) return;
    
    // Clear any existing interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    detectionInterval.current = setInterval(() => {
      // Simulate hand detection (in real app, this would use ML model)
      const handDetected = Math.random() > 0.7; // 30% chance of hand detection
      
      if (handDetected !== handPresent) {
        setHandPresent(handDetected);
        if (onHandDetected) {
          onHandDetected(handDetected);
        }
      }
      
      if (handDetected) {
        // Simulate gesture detection when hand is present
        const gestures: GestureType[] = ['call', 'hangup', 'save', 'delete'];
        const randomGesture = Math.random() > 0.8 ? 
          gestures[Math.floor(Math.random() * gestures.length)] : 'none';
        
        setDetectedGesture(randomGesture);
        
        if (randomGesture !== 'none') {
          onGestureDetected(randomGesture);
        }
      } else {
        setDetectedGesture('none');
      }
    }, 1000); // Check every second
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [isActive, permission?.granted, handPresent, onGestureDetected, onHandDetected]);
  
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
          Camera permission is required for automatic gesture detection
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
          Show your hand to activate gestures
        </Text>
      </View>
    );
  }
  
  const getGestureDescription = (gesture: GestureType) => {
    switch (gesture) {
      case 'call': return 'Point to call';
      case 'hangup': return 'Palm to hang up';
      case 'save': return 'Thumbs up to save';
      case 'delete': return 'Fist to delete';
      default: return 'Make a gesture...';
    }
  };
  
  return (
    <View style={styles.container}>
      <CameraView 
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