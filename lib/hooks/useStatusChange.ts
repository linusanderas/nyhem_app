import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { setLastChange } from '@/lib/storage';

export function useStatusChange() {
  return useQuery({
    queryKey: ['statusChange'],
    queryFn: async () => {
      const status = await api.getStatusChange();
      await setLastChange(status.lastChange);
      return status;
    },
    refetchInterval: 1000 * 60 * 5,
  });
}
