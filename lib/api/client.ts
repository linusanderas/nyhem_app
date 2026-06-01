import { Ad, AppEvent, AppPage, StatusChange } from '@/types';

const API_BASE_URL = 'https://api2.intranet.nyhemsveckan.se';
const API_TOKEN = '38f949f4-284e-4f8f-8cf2-48d471d84bcc';

const headers = {
  'X-Access-Token': API_TOKEN,
  'Content-Type': 'application/json',
};

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getStatusChange: () => fetchApi<StatusChange>('/app/status/change'),

  getEvents: () => fetchApi<AppEvent[]>('/app/event'),

  getPages: () => fetchApi<AppPage[]>('/app/page'),

  getAd1: () => fetchApi<Ad>('/app/ad/1'),

  getAd2: () => fetchApi<Ad>('/app/ad/2'),
};
