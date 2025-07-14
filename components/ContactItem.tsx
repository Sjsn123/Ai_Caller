import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Phone, Star, StarOff } from 'lucide-react-native';
import { Contact } from '@/types';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useContactsStore } from '@/store/contacts-store';

type ContactItemProps = {
  contact: Contact;
  onPress: (contact: Contact) => void;
  onCall: (phoneNumber: string) => void;
};

export default function ContactItem({ contact, onPress, onCall }: ContactItemProps) {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { toggleFavorite } = useContactsStore();

  const defaultAvatar = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop';

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(contact)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: contact.photoUrl || defaultAvatar }}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>
          {contact.name}
        </Text>
        <Text style={[styles.phone, { color: colors.subtext }]}>
          {contact.phoneNumber}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.primary }]}
          onPress={() => onCall(contact.phoneNumber)}
        >
          <Phone size={18} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.favoriteButton]}
          onPress={() => toggleFavorite(contact.id)}
        >
          {contact.favorite ? (
            <Star size={22} color={colors.warning} fill={colors.warning} />
          ) : (
            <StarOff size={22} color={colors.subtext} />
          )}
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  phone: {
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
  favoriteButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});