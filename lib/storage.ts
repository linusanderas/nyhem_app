import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppEvent, AppPage } from '@/types';

export const STORAGE_KEYS = {
  events: 'events',
  pages: 'pages',
  favoritedEvents: 'favorited_events',
  showFavorites: 'show_favorites',
  lastChange: 'lastChange',
  ad1: 'ad1',
  ad2: 'ad2',
} as const;

export async function getStoredEvents(): Promise<AppEvent[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.events);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function setStoredEvents(events: AppEvent[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

export async function getStoredPages(): Promise<AppPage[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.pages);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function setStoredPages(pages: AppPage[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(pages));
}

export async function getFavoritedEvents(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.favoritedEvents);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function setFavoritedEvents(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.favoritedEvents, JSON.stringify(ids));
}

export async function getShowFavorites(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.showFavorites);
    return data ? JSON.parse(data) : false;
  } catch {
    return false;
  }
}

export async function setShowFavorites(show: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.showFavorites, JSON.stringify(show));
}

export async function getLastChange(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.lastChange);
    return data || '';
  } catch {
    return '';
  }
}

export async function setLastChange(value: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.lastChange, value);
}

export async function getStoredAd1(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ad1);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setStoredAd1(ad: any): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ad1, JSON.stringify(ad));
}

export async function getStoredAd2(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ad2);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setStoredAd2(ad: any): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ad2, JSON.stringify(ad));
}
