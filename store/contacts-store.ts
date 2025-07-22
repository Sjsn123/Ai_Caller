import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Contact } from '@/types';

type ContactsState = {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  toggleFavorite: (id: string) => void;
};

export const useContactsStore = create<ContactsState>()(
  persist(
    (set) => ({
      contacts: [],
      addContact: (contact) => 
        set((state) => ({ 
          contacts: [...state.contacts, contact] 
        })),
      updateContact: (contact) => 
        set((state) => ({ 
          contacts: state.contacts.map(c => 
            c.id === contact.id ? contact : c
          ) 
        })),
      deleteContact: (id) => 
        set((state) => ({ 
          contacts: state.contacts.filter(c => c.id !== id) 
        })),
      toggleFavorite: (id) => 
        set((state) => ({ 
          contacts: state.contacts.map(c => 
            c.id === id ? { ...c, favorite: !c.favorite } : c
          ) 
        })),
    }),
    {
      name: 'contacts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);