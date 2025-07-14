import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  Phone, 
  Edit2, 
  Trash2, 
  Star, 
  StarOff,
  Share2
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useContactsStore } from '@/store/contacts-store';
import * as Haptics from 'expo-haptics';

export default function ContactDetailsScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, deleteContact, toggleFavorite } = useContactsStore();
  
  const contact = contacts.find(c => c.id === id);
  
  if (!contact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Contact not found
        </Text>
      </View>
    );
  }
  
  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.push({
      pathname: '/call',
      params: { 
        number: contact.phoneNumber,
        name: contact.name,
        photo: contact.photoUrl
      }
    });
  };
  
  const handleEdit = () => {
    router.push({
      pathname: '/contact/new',
      params: { 
        id: contact.id,
        edit: 'true'
      }
    });
  };
  
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const shouldDelete = window.confirm(`Delete contact ${contact.name}?`);
      if (shouldDelete) {
        deleteContact(contact.id);
        router.back();
      }
    } else {
      Alert.alert(
        'Delete Contact',
        `Are you sure you want to delete ${contact.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              deleteContact(contact.id);
              router.back();
            }
          },
        ]
      );
    }
  };
  
  const handleToggleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleFavorite(contact.id);
  };
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop';
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: contact.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Edit2 size={20} color={colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.profileSection}>
        <Image
          source={{ uri: contact.photoUrl || defaultAvatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        
        <Text style={[styles.name, { color: colors.text }]}>
          {contact.name}
        </Text>
        
        <Text style={[styles.phone, { color: colors.subtext }]}>
          {contact.phoneNumber}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleCall}
          >
            <Phone size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleToggleFavorite}
          >
            {contact.favorite ? (
              <>
                <Star size={24} color={colors.warning} fill={colors.warning} />
                <Text style={[styles.actionText, { color: colors.text }]}>Favorite</Text>
              </>
            ) : (
              <>
                <StarOff size={24} color={colors.subtext} />
                <Text style={[styles.actionText, { color: colors.text }]}>Add to Favorites</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
          >
            <Share2 size={24} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  phone: {
    fontSize: 18,
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  actionText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});