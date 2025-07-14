import { CallLog } from '@/types';

export const mockCallLogs: CallLog[] = [
  {
    id: '1',
    contactId: '1',
    name: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: 125, // 2 minutes 5 seconds
    type: 'outgoing',
  },
  {
    id: '2',
    contactId: '2',
    name: 'Jane Smith',
    phoneNumber: '+1 (555) 987-6543',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    duration: 0,
    type: 'missed',
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 333-4444',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    duration: 45,
    type: 'incoming',
  },
  {
    id: '4',
    contactId: '3',
    name: 'Robert Johnson',
    phoneNumber: '+1 (555) 456-7890',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 312, // 5 minutes 12 seconds
    type: 'incoming',
  },
  {
    id: '5',
    contactId: '1',
    name: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    duration: 67,
    type: 'outgoing',
  },
];