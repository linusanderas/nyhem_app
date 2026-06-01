import { create } from 'zustand';
import { Ad } from '@/types';

interface SessionState {
  ad1: Ad | null;
  ad2: Ad | null;
  setAd1: (ad: Ad | null) => void;
  setAd2: (ad: Ad | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  ad1: null,
  ad2: null,
  setAd1: (ad) => set({ ad1: ad }),
  setAd2: (ad) => set({ ad2: ad }),
}));
