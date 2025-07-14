import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Camera, X, Check, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useContactsStore } from '@/store/contacts-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function NewContactScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { number, id, edit, suggestedName } = useLocalSearchParams<{ 
    number?: string;
    id?: string;
    edit?: string;
    suggestedName?: string;
  }>();
  
  const { contacts, addContact, updateContact } = useContactsStore();
  const isEditing = edit === 'true';
  
  const existingContact = id ? contacts.find(c => c.id === id) : undefined;
  
  const [name, setName] = useState(existingContact?.name || suggestedName || '');
  const [phoneNumber, setPhoneNumber] = useState(existingContact?.phoneNumber || number || '');
  const [photoUrl, setPhotoUrl] = useState(existingContact?.photoUrl || '');
  const [errors, setErrors] = useState({ name: '', phoneNumber: '' });
  
  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name);
      setPhoneNumber(existingContact.phoneNumber);
      setPhotoUrl(existingContact.photoUrl || '');
    } else if (suggestedName) {
      setName(suggestedName);
    }
  }, [existingContact, suggestedName]);
  
  const validateForm = () => {
    const newErrors = { name: '', phoneNumber: '' };
    let isValid = true;
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^[+\d\s()-]{5,20}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid phone number';
      isValid = false;
    }
    
    // Check for duplicate phone numbers (except when editing the same contact)
    const duplicateContact = contacts.find(c => 
      c.phoneNumber === phoneNumber && c.id !== id
    );
    if (duplicateContact) {
      newErrors.phoneNumber = `This number already exists for ${duplicateContact.name}`;
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (isEditing && existingContact) {
      updateContact({
        ...existingContact,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        photoUrl,
      });
    } else {
      addContact({
        id: Date.now().toString(),
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        photoUrl,
        favorite: false,
      });
    }
    
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUrl(result.assets[0].uri);
    }
  };
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop';
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Contact' : 'New Contact',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Check size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color={colors.error} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.form}>
        <View style={styles.photoContainer}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
              <User size={40} color={colors.subtext} />
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.photoButton, { backgroundColor: colors.primary }]}
            onPress={handlePickImage}
          >
            <Camera size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          error={errors.name}
          autoCapitalize="words"
        />
        
        <Input
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />
        
        <View style={styles.actions}>
          <Button
            title={isEditing ? "Update Contact" : "Save Contact"}
            onPress={handleSave}
            style={{ marginTop: 16 }}
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
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
  form: {
    marginTop: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginTop: 24,
  },
});