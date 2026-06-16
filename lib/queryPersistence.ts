import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data är "färsk" i 30 min — ingen onödig refetch vid navigering
      staleTime: 1000 * 60 * 30,
      // Behåll cache "för alltid" så offline-användare alltid ser senaste datan
      gcTime: Infinity,
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      // Visar alltid cached data direkt, refetch i bakgrunden
      // (default-beteendet hos React Query) — ger omedelbar offline-UX
    },
  },
});

// Persisterar hela query-cachen till AsyncStorage.
// Throttled till 2s för att inte spamma disk på snabba uppdateringar.
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'nyhemsveckan.query-cache',
  throttleTime: 2000,
});
