import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Phone,
  Info
} from 'lucide-react-native';
import { CallLog } from '@/types';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

type CallLogItemProps = {
  callLog: CallLog;
  onPress: (callLog: CallLog) => void;
  onCall: (phoneNumber: string) => void;
};

export default function CallLogItem({ callLog, onPress, onCall }: CallLogItemProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];

  const formatDate = (date: Date) => {
    const now = new Date();
    const callDate = new Date(date);
    
    // If today, show time
    if (callDate.toDateString() === now.toDateString()) {
      return callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (callDate.getFullYear() === now.getFullYear()) {
      return callDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return callDate.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCallIcon = () => {
    switch (callLog.type) {
      case 'incoming':
        return <PhoneIncoming size={18} color={colors.success} />;
      case 'outgoing':
        return <PhoneOutgoing size={18} color={colors.primary} />;
      case 'missed':
        return <PhoneMissed size={18} color={colors.error} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(callLog)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getCallIcon()}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>
          {callLog.name || callLog.phoneNumber}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text style={[styles.time, { color: colors.subtext }]}>
            {formatDate(callLog.timestamp)}
          </Text>
          
          {callLog.type !== 'missed' && (
            <Text style={[styles.duration, { color: colors.subtext }]}>
              {formatDuration(callLog.duration)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.primary }]}
          onPress={() => onCall(callLog.phoneNumber)}
        >
          <Phone size={18} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.secondary }]}
          onPress={() => onPress(callLog)}
        >
          <Info size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    marginRight: 8,
  },
  duration: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});