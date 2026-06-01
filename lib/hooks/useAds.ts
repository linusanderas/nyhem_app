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
