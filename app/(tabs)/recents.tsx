import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useCallLogsStore } from '@/store/call-logs-store';
import CallLogItem from '@/components/CallLogItem';
import * as Haptics from 'expo-haptics';

export default function RecentsScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { callLogs, clearCallLogs, deleteCallLog } = useCallLogsStore();
  
  const sortedCallLogs = useMemo(() => {
    return [...callLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [callLogs]);
  
  const handleCallLogPress = (callLog: typeof callLogs[0]) => {
    // Navigate to call details or contact details if available
    if (callLog.contactId) {
      router.push(`/contact/${callLog.contactId}`);
    } else {
      // Show options for unknown number
      if (Platform.OS === 'web') {
        const shouldCall = window.confirm(`Call ${callLog.phoneNumber}?`);
        if (shouldCall) {
          handleCall(callLog.phoneNumber);
        }
      } else {
        Alert.alert(
          callLog.phoneNumber,
          'What would you like to do?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => handleCall(callLog.phoneNumber) },
            { text: 'Add to Contacts', onPress: () => router.push({
              pathname: '/contact/new',
              params: { number: callLog.phoneNumber }
            }) },
          ]
        );
      }
    }
  };
  
  const handleCall = (phoneNumber: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.push({
      pathname: '/call',
      params: { number: phoneNumber }
    });
  };
  
  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      const shouldClear = window.confirm('Clear all call history?');
      if (shouldClear) {
        clearCallLogs();
      }
    } else {
      Alert.alert(
        'Clear Call History',
        'Are you sure you want to clear all call history?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear All', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              clearCallLogs();
            }
          },
        ]
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Call History</Text>
        
        {callLogs.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {callLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            No call history yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedCallLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CallLogItem
              callLog={item}
              onPress={handleCallLogPress}
              onCall={handleCall}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});