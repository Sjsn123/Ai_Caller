import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Phone, Delete } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import FloatingButton from './FloatingButton';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type DialPadProps = {
  value: string;
  onChange: (value: string) => void;
  onCall: (number: string) => void;
};

export default function DialPad({ value, onChange, onCall }: DialPadProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];

  const handleKeyPress = (key: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(value + key);
  };

  const handleDelete = () => {
    if (value.length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onChange(value.slice(0, -1));
    }
  };

  const handleCall = () => {
    if (value.length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onCall(value);
    }
  };

  const renderKey = (key: string, subText?: string) => (
    <TouchableOpacity
      style={[styles.key, { backgroundColor: colors.card }]}
      onPress={() => handleKeyPress(key)}
      activeOpacity={0.7}
    >
      <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
      {subText && (
        <Text style={[styles.subText, { color: colors.subtext }]}>{subText}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text 
          style={[styles.displayText, { color: colors.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          {renderKey('1')}
          {renderKey('2', 'ABC')}
          {renderKey('3', 'DEF')}
        </View>
        <View style={styles.row}>
          {renderKey('4', 'GHI')}
          {renderKey('5', 'JKL')}
          {renderKey('6', 'MNO')}
        </View>
        <View style={styles.row}>
          {renderKey('7', 'PQRS')}
          {renderKey('8', 'TUV')}
          {renderKey('9', 'WXYZ')}
        </View>
        <View style={styles.row}>
          {renderKey('*')}
          {renderKey('0', '+')}
          {renderKey('#')}
        </View>
      </View>

      <View style={styles.actions}>
        <FloatingButton
          onPress={handleCall}
          disabled={value.length === 0}
          variant="success"
          size="large"
        >
          <Phone size={24} color="#FFFFFF" />
        </FloatingButton>

        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={handleDelete}
          onLongPress={() => onChange('')}
          disabled={value.length === 0}
          activeOpacity={0.7}
        >
          <Delete size={24} color={value.length > 0 ? colors.error : colors.subtext} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  display: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  displayText: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  keypad: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
  },
  subText: {
    fontSize: 10,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});