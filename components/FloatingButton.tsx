import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  ViewStyle,
  Platform
} from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import * as Haptics from 'expo-haptics';

type FloatingButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  floating?: boolean;
};

export default function FloatingButton({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  floating = true,
}: FloatingButtonProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (floating) {
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [floating, floatAnim]);

  const handlePressIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: size === 'small' ? 20 : size === 'medium' ? 25 : 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { width: 40, height: 40 },
      medium: { width: 50, height: 50 },
      large: { width: 60, height: 60 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.secondary },
      accent: { backgroundColor: colors.accent },
      success: { backgroundColor: colors.success },
      error: { backgroundColor: colors.error },
      warning: { backgroundColor: colors.warning },
    };

    // Disabled style
    const disabledStyle: ViewStyle = {
      opacity: 0.6,
      shadowOpacity: 0.1,
      elevation: 4,
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      disabled && disabledStyle,
      style,
    ];
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { translateY: floating ? floatAnim : 0 },
        ],
      }}
    >
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}