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
    placeholderData: [],
  });
}
