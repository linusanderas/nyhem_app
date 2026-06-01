# Nyhemsveckan — Phase 2: Backend/Data/Logic Implementation Plan

## Overview
Wire up the API, persistent storage, and state management to replace mock data with real data from the Nyhemsveckan API.

---

## Assumptions & Open Questions

- [ ] **@react-native-async-storage/async-storage** needs to be added as a dependency (not currently in package.json)
- [ ] Confirm @tanstack/react-query is acceptable (already in dependencies)
- [ ] Session state (ads) can be stored in a simple React context or zustand store
- [ ] API should be called on app launch and on pull-to-refresh

---

## Data Flow

```
API Response → react-query (cache/server state)
                      ↓
              zustand store (favorites, showFavorites filter)
                      ↓
              AsyncStorage (persistent: events, pages, favorites, lastChange)
```

---

## Step-by-Step Implementation

### 1. Add Required Dependency
```bash
npx expo install @react-native-async-storage/async-storage
```
**Why:** AsyncStorage is used for persistent data (events, pages, favoritedEvents, showFavorites, lastChange) per the spec.

---

### 2. Update `app/_layout.tsx`
- Wrap `RootContent` with `QueryClientProvider`
- Create a `QueryClient` instance

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
```

Wrap the return in `<QueryClientProvider client={queryClient}>`.

---

### 3. Create Session Store (`lib/stores/sessionStore.ts`)
Store ads in a simple zustand store (session state, resets on restart):

```typescript
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
```

---

### 4. Create Data Hooks (`lib/hooks/`)

#### `useEvents.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getStoredEvents, setStoredEvents } from '@/lib/storage';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const events = await api.getEvents();
      await setStoredEvents(events);
      return events;
    },
    initialData: () => getStoredEvents(),
  });
}
```

#### `usePages.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getStoredPages, setStoredPages } from '@/lib/storage';

export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const pages = await api.getPages();
      await setStoredPages(pages);
      return pages;
    },
    initialData: () => getStoredPages(),
  });
}
```

#### `useAds.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSessionStore } from '@/lib/stores/sessionStore';

export function useAd1() {
  const setAd1 = useSessionStore((s) => s.setAd1);
  return useQuery({
    queryKey: ['ad1'],
    queryFn: async () => {
      const ad = await api.getAd1();
      setAd1(ad);
      return ad;
    },
  });
}

export function useAd2() {
  const setAd2 = useSessionStore((s) => s.setAd2);
  return useQuery({
    queryKey: ['ad2'],
    queryFn: async () => {
      const ad = await api.getAd2();
      setAd2(ad);
      return ad;
    },
  });
}
```

#### `useStatusChange.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getLastChange, setLastChange } from '@/lib/storage';

export function useStatusChange() {
  return useQuery({
    queryKey: ['statusChange'],
    queryFn: async () => {
      const status = await api.getStatusChange();
      await setLastChange(status.lastChange);
      return status;
    },
    refetchInterval: 1000 * 60 * 5, // poll every 5 minutes
  });
}
```

---

### 5. Create Favorites Store (`lib/stores/favoritesStore.ts`)
```typescript
import { create } from 'zustand';
import { getFavoritedEvents, setFavoritedEvents, getShowFavorites, setShowFavorites } from '@/lib/storage';

interface FavoritesState {
  favoritedIds: number[];
  showFavorites: boolean;
  toggleFavorite: (id: number) => void;
  setShowFavorites: (show: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoritedIds: [],
  showFavorites: false,
  toggleFavorite: async (id) => {
    const { favoritedIds } = get();
    const newIds = favoritedIds.includes(id)
      ? favoritedIds.filter((i) => i !== id)
      : [...favoritedIds, id];
    set({ favoritedIds: newIds });
    await setFavoritedEvents(newIds);
  },
  setShowFavorites: async (show) => {
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
```

---

### 6. Update Screens to Use Real Data

#### `app/(tabs)/index.tsx`
- Add `useAd1()` hook to fetch home screen ad
- Display ad banner at top if `ad1` exists

#### `app/(tabs)/program.tsx`
- Replace `mockEvents` with `useEvents()` hook
- Use `useFavoritesStore` to filter by favorites
- Add favorite toggle button to each event card
- Connect speaker/location cards to navigate to detail screens with real IDs

#### `app/(tabs)/allinfo.tsx`
- Replace `infoPages` with `usePages()` hook
- Connect info cards to navigate to `/info/[id]` with real IDs

#### Detail Screens (`speaker/[id]`, `location/[id]`, `info/[id]`)
- Use `useEvents()` or `usePages()` to fetch data
- Use route params to find specific item by ID

---

### 7. Add Loading/Error/Empty States

All screens should handle:
- **Loading:** Show skeleton/spinner while query is pending
- **Error:** Show error message with retry button
- **Empty:** Show appropriate empty state message

---

### 8. Implement Pull-to-Refresh
- Add `PullToRefresh` or use `useRefresh` pattern with react-query's `refetch`

---

## File Structure (Phase 2 additions)

```
lib/
  api/
    client.ts       (existing)
    index.ts        (existing)
  storage/
    index.ts        (existing)
  hooks/
    useEvents.ts    (new)
    usePages.ts     (new)
    useAd1.ts       (new)
    useAd2.ts       (new)
    useStatusChange.ts (new)
  stores/
    sessionStore.ts (new)
    favoritesStore.ts (new)

app/
  (tabs)/
    index.tsx       (update - use hooks)
    program.tsx     (update - use hooks, favorites)
    allinfo.tsx     (update - use hooks)
  speaker/
    [id].tsx        (update - use hooks)
  location/
    [id].tsx        (update - use hooks)
  info/
    [id].tsx        (update - use hooks)
```

---

## Testing Checklist

- [ ] App loads and shows real data from API
- [ ] Favorites persist across app restarts
- [ ] Ad banners display correctly
- [ ] Pull-to-refresh works
- [ ] Loading/error states display properly
- [ ] Navigation to detail screens works with real IDs
- [ ] Light/dark mode still looks correct

---

## Out of Scope for Phase 2

- Authentication/authorization
- Push notifications
- Offline mode (beyond basic AsyncStorage caching)
- Analytics
- E2E testing
