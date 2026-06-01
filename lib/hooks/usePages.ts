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
    placeholderData: [],
  });
}
