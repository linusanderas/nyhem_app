export interface AppEvent {
  id: number;
  title: string;
  category: 'program' | 'open' | 'send';
  start_at: string;
  end_at: string;
  tags: { name: string; color: string }[];
  speakers: { id: number; title: string; imageUrl: string | null }[];
  locations: { id: number; title: string; imageUrl: string | null }[];
  text: string | null;
  is_approved: boolean;
}

export interface AppPage {
  id: number;
  title: string;
  category: 'page';
  tags: { name: string; color: string }[];
  text: string | null;
  imageUrl: string | null;
  is_approved: boolean;
}

export interface Ad {
  image: string;
  link: string;
}

export interface StatusChange {
  lastChange: string;
}
