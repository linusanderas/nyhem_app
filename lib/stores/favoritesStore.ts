import { create } from 'zustand';
import { getFavoritedEvents, setFavoritedEvents, getShowFavorites, setShowFavorites } from '@/lib/storage';
import { subscribeToEventTopic, unsubscribeFromEventTopic } from '@/lib/notifications';

interface FavoritesState {
  favoritedIds: number[];
  showFavorites: boolean;
  toggleFavorite: (id: number) => void;
  setShowFavoritesFilter: (show: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoritedIds: [],
  showFavorites: false,
  toggleFavorite: async (id) => {
    const { favoritedIds, showFavorites } = get();
    const isFavorited = favoritedIds.includes(id);
    const newIds = isFavorited
      ? favoritedIds.filter((i) => i !== id)
      : [...favoritedIds, id];
    const newShowFavorites = newIds.length === 0 ? false : showFavorites;
    set({ favoritedIds: newIds, showFavorites: newShowFavorites });
    await setFavoritedEvents(newIds);
    await setShowFavorites(newShowFavorites);

    if (isFavorited) {
      await unsubscribeFromEventTopic(id);
    } else {
      await subscribeToEventTopic(id);
    }
  },
  setShowFavoritesFilter: async (show) => {
    set({ showFavorites: show });
    await setShowFavorites(show);
  },
  loadFromStorage: async () => {
    const [favoritedIds, showFavorites] = await Promise.all([
      getFavoritedEvents(),
      getShowFavorites(),
    ]);
    set({ favoritedIds, showFavorites });
  },
}));
