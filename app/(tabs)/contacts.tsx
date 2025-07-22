import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useContactsStore } from '@/store/contacts-store';
import ContactItem from '@/components/ContactItem';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ContactsScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { contacts } = useContactsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];
    
    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.favorite);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) || 
        contact.phoneNumber.includes(query)
      );
    }
    
    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchQuery, showFavoritesOnly]);
  
  const handleContactPress = (contact: typeof contacts[0]) => {
    router.push(`/contact/${contact.id}`);
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
  
  const handleAddContact = () => {
    router.push('/contact/new');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddContact}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.subtext} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <TouchableOpacity 
          style={[
            styles.favoriteFilter, 
            { backgroundColor: showFavoritesOnly ? colors.warning : 'transparent' }
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star 
            size={20} 
            color={showFavoritesOnly ? '#FFFFFF' : colors.subtext}
            fill={showFavoritesOnly ? '#FFFFFF' : 'none'}
          />
        </TouchableOpacity>
      </View>
      
      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            {contacts.length === 0 
              ? 'No contacts yet. Add your first contact!' 
              : 'No contacts match your search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onPress={handleContactPress}
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
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  favoriteFilter: {
    padding: 8,
    borderRadius: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});