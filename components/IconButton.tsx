import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle,
} from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

type IconButtonProps = {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
};

export default function IconButton({
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}: IconButtonProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];

  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { padding: 8 },
      medium: { padding: 12 },
      large: { padding: 16 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { 
        backgroundColor: colors.primary,
      },
      secondary: { 
        backgroundColor: colors.secondary,
      },
      outline: { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      },
      ghost: { 
        backgroundColor: 'transparent',
      },
    };

    // Disabled style
    const disabledStyle: ViewStyle = {
      opacity: 0.6,
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
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
}