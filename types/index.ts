export type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  photoUrl?: string;
  favorite: boolean;
  lastCalled?: Date;
};

export type CallLog = {
  id: string;
  contactId?: string;
  name?: string;
  phoneNumber: string;
  timestamp: Date;
  duration: number; // in seconds
  type: 'incoming' | 'outgoing' | 'missed';
};

export type GestureType = 
  | 'call' // point finger
  | 'hangup' // open palm
  | 'save' // thumbs up
  | 'delete' // fist
  | 'none';

export type VoiceCommand =
  | 'call'
  | 'save'
  | 'delete'
  | 'block'
  | 'none';

export type Theme = 'light' | 'dark';

export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};