import { Contact } from '@/types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    favorite: true,
    lastCalled: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '2',
    name: 'Jane Smith',
    phoneNumber: '+1 (555) 987-6543',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    favorite: true,
    lastCalled: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: '3',
    name: 'Robert Johnson',
    phoneNumber: '+1 (555) 456-7890',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    favorite: false,
    lastCalled: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '4',
    name: 'Emily Davis',
    phoneNumber: '+1 (555) 234-5678',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    favorite: false,
  },
  {
    id: '5',
    name: 'Michael Wilson',
    phoneNumber: '+1 (555) 876-5432',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    favorite: false,
  },
];