import { AppEvent, AppPage } from '@/types';
import { setStoredEvents, setStoredPages, setLastChange } from '@/lib/storage';

const API_BASE_URL = 'https://api2.intranet.nyhemsveckan.se';
const API_TOKEN = '38f949f4-284e-4f8f-8cf2-48d471d84bcc';

export async function checkAndRefreshData(
  currentLastChange: string,
  setEvents: (v: AppEvent[]) => void,
  setPages: (v: AppPage[]) => void,
  setLastChange: (v: string) => void
): Promise<void> {
  const headers = { 'X-Access-Token': API_TOKEN };
  try {
    const res = await fetch(`${API_BASE_URL}/app/status/change`, { headers });
    const data = await res.json();
    if (data.lastChange !== currentLastChange) {
      const [eventsRes, pagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/app/event`, { headers }),
        fetch(`${API_BASE_URL}/app/page`, { headers }),
      ]);
      const events = await eventsRes.json();
      const pages = await pagesRes.json();
      setEvents(events);
      setPages(pages);
      await setStoredEvents(events);
      await setStoredPages(pages);
      setLastChange(data.lastChange);
      await setLastChange(data.lastChange);
    }
  } catch (e) {
    console.log('Data refresh failed, using cache', e);
  }
}
