import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CallLog } from '@/types';

type CallLogsState = {
  callLogs: CallLog[];
  addCallLog: (log: CallLog) => void;
  deleteCallLog: (id: string) => void;
  clearCallLogs: () => void;
};

export const useCallLogsStore = create<CallLogsState>()(
  persist(
    (set) => ({
      callLogs: [],
      addCallLog: (log) => 
        set((state) => ({ 
          callLogs: [log, ...state.callLogs] 
        })),
      deleteCallLog: (id) => 
        set((state) => ({ 
          callLogs: state.callLogs.filter(log => log.id !== id) 
        })),
      clearCallLogs: () => set({ callLogs: [] }),
    }),
    {
      name: 'call-logs-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);