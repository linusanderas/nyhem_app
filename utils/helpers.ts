import { AppEvent, AppPage } from '@/types';

export function getDebugDate(): Date {
  const debug = process.env.EXPO_PUBLIC_DEBUG_DATE;
  return debug ? new Date(debug) : new Date();
}

export function formatEventTime(event: AppEvent): string {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

export function stripHtml(html: string | null): string {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]*>/g, '').replace(/Lyssna live här &gt;?/g, '')).trim();
}

export function extractUniqueDays(events: AppEvent[]): number[] {
  const days = events.map(e => new Date(e.start_at).getDate());
  return [...new Set(days)].sort((a, b) => a - b);
}

export function extractUniqueTags(events: AppEvent[]): { name: string; color: string }[] {
  const allTags = events.flatMap(e => e.tags);
  const seen = new Set<string>();
  return allTags.filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true; });
}

export function filterProgramEvents(
  events: AppEvent[], currentDay: number, currentTags: string[],
  showFavorites: boolean, favoritedEvents: number[], showSend: boolean
): AppEvent[] {
  return events
    .filter(e => e.category === 'program' || e.category === 'send')
    .filter(e => new Date(e.start_at).getDate() === currentDay)
    .filter(e => !showFavorites || favoritedEvents.includes(e.id))
    .filter(e => currentTags.length === 0 || e.tags.some(t => currentTags.includes(t.name)))
    .filter(e => showSend ? true : e.category === 'program');
}

export function getEventOpacity(event: AppEvent): number {
  const now = getDebugDate();
  const end = new Date(event.end_at);
  return end.getDate() === now.getDate() && end.getTime() < now.getTime() ? 0.5 : 1;
}

export function extractCurrentEvents(events: AppEvent[]): AppEvent[] {
  const now = getDebugDate().getTime();
  const soonCutoff = now + 1000 * 60 * 30;
  return events
    .filter(e => e.category === 'program')
    .filter(e => new Date(e.end_at).getTime() > now && new Date(e.start_at).getTime() < soonCutoff)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

export function extractNextSession(events: AppEvent[]): AppEvent | null {
  const now = getDebugDate().getTime();
  const upcoming = events
    .filter(e => e.category === 'program')
    .filter(e => new Date(e.end_at).getTime() > now)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  return upcoming[0] || null;
}

export function extractTodayProgram(events: AppEvent[], limit = 4): AppEvent[] {
  const today = getDebugDate().getDate();
  const now = getDebugDate().getTime();
  return events
    .filter(e => e.category === 'program')
    .filter(e => new Date(e.start_at).getDate() === today)
    .filter(e => new Date(e.end_at).getTime() > now)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, limit);
}

export interface TodaySpeaker {
  id: number;
  name: string;
  imageUrl: string | null;
  subtitle: string | null;
}

function buildSpeakerSubtitle(speakerId: number, pages: AppPage[]): string | null {
  const page = pages.find(p => p.id === speakerId);
  const text = page?.text ? stripHtml(page.text) : null;
  if (!text) return null;
  const firstSentence = text.split(/[.\n]/)[0].trim();
  return firstSentence.length > 0 ? firstSentence : null;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function extractTodaySpeakers(events: AppEvent[], pages: AppPage[]): TodaySpeaker[] {
  const today = getDebugDate();
  const todayEvents = events
    .filter(e => e.category === 'program')
    .filter(e => isSameDay(new Date(e.start_at), today))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const seen = new Set<number>();
  const speakers: TodaySpeaker[] = [];
  for (const event of todayEvents) {
    for (const sp of event.speakers) {
      if (seen.has(sp.id)) continue;
      seen.add(sp.id);
      speakers.push({
        id: sp.id,
        name: decodeEntities(sp.title),
        imageUrl: sp.imageUrl,
        subtitle: buildSpeakerSubtitle(sp.id, pages),
      });
    }
  }
  return speakers;
}

export interface SpeakerWithSessions extends TodaySpeaker {
  sessions: string[];
}

export interface SpeakerDayGroup {
  day: number;
  date: Date;
  speakers: SpeakerWithSessions[];
}

export function extractSpeakersByDay(events: AppEvent[], pages: AppPage[]): SpeakerDayGroup[] {
  const programEvents = events
    .filter(e => e.category === 'program')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const dayMap = new Map<
    number,
    { date: Date; speakerMap: Map<number, SpeakerWithSessions> }
  >();
  for (const event of programEvents) {
    if (event.speakers.length === 0) continue;
    const start = new Date(event.start_at);
    const day = start.getDate();
    let group = dayMap.get(day);
    if (!group) {
      group = { date: start, speakerMap: new Map() };
      dayMap.set(day, group);
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const sessionLabel = `${decodeEntities(event.title)} kl. ${pad(start.getHours())}:${pad(start.getMinutes())}`;
    for (const sp of event.speakers) {
      let entry = group.speakerMap.get(sp.id);
      if (!entry) {
        entry = {
          id: sp.id,
          name: decodeEntities(sp.title),
          imageUrl: sp.imageUrl,
          subtitle: buildSpeakerSubtitle(sp.id, pages),
          sessions: [],
        };
        group.speakerMap.set(sp.id, entry);
      }
      if (!entry.sessions.includes(sessionLabel)) {
        entry.sessions.push(sessionLabel);
      }
    }
  }

  return Array.from(dayMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, group]) => ({
      day,
      date: group.date,
      speakers: Array.from(group.speakerMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name, 'sv', { sensitivity: 'base' })
      ),
    }));
}

export function getEventsForSpeaker(events: AppEvent[], speakerId: number): AppEvent[] {
  return events
    .filter(e => e.speakers.some(s => s.id === speakerId))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

export function formatEventDate(event: AppEvent): string {
  const start = new Date(event.start_at);
  const weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${weekdays[start.getDay()]} ${start.getDate()} ${months[start.getMonth()]}`;
}

export function isEventLive(event: AppEvent): boolean {
  const now = getDebugDate().getTime();
  return new Date(event.start_at).getTime() <= now && new Date(event.end_at).getTime() > now;
}

export function getTodayWeekdayPossessive(): string {
  const weekdays = ['SÖNDAGENS', 'MÅNDAGENS', 'TISDAGENS', 'ONSDAGENS', 'TORSDAGENS', 'FREDAGENS', 'LÖRDAGENS'];
  return weekdays[getDebugDate().getDay()];
}

export function extractOpenNow(events: AppEvent[]): { title: string; open: boolean; minutesUntilClose: number | null }[] {
  const now = getDebugDate().getTime();
  const openEvents = events.filter(e => e.category === 'open');
  const titles = [...new Set(openEvents.map(e => e.title))].sort();
  return titles.map(title => {
    const openEvent = openEvents.find(e =>
      e.title === title &&
      new Date(e.start_at).getTime() <= now &&
      new Date(e.end_at).getTime() >= now
    );
    const minutesUntilClose = openEvent
      ? Math.max(0, Math.ceil((new Date(openEvent.end_at).getTime() - now) / 60000))
      : null;
    return {
      title,
      open: !!openEvent,
      minutesUntilClose
    };
  });
}

export function getDefaultDay(): number {
  const today = getDebugDate().getDate();
  return today < 14 ? 14 : today;
}

export function getEventsFromTitle(title: string, events: AppEvent[], day: number): AppEvent[] {
  return events.filter(e => new Date(e.start_at).getDate() === day && e.title === title);
}

export function getImgFromTitle(title: string, events: AppEvent[], day: number): string | null {
  const evs = events.filter(e => new Date(e.start_at).getDate() === day && e.title === title);
  for (const e of evs) { if (e.locations[0]?.imageUrl) return e.locations[0].imageUrl; }
  return null;
}

export function getLocationIdFromTitle(title: string, events: AppEvent[], day: number): number | null {
  const evs = events.filter(e => new Date(e.start_at).getDate() === day && e.title === title);
  for (const e of evs) { if (e.locations[0]?.id) return e.locations[0].id; }
  return null;
}

export function getDescriptionFromTitle(title: string, events: AppEvent[], day: number): string | null {
  const evs = events.filter(e => new Date(e.start_at).getDate() === day && e.title === title);
  return evs.map(e => e.text || '').join('') || null;
}

export function extractTitlesForDay(events: AppEvent[], day: number): string[] {
  const titles = events.filter(e => new Date(e.start_at).getDate() === day).map(e => e.title);
  return [...new Set(titles)];
}

export function filterInfoPages(pages: AppPage[], currentTag: string): AppPage[] {
  return pages.filter(p => {
    if (currentTag === 'FAQ') return p.tags.length === 0;
    return p.tags.some(t => t.name === currentTag);
  });
}

export function extractInfoTags(pages: AppPage[]): string[] {
  const allTags = pages.flatMap(p => p.tags.map(t => t.name));
  const unique = [...new Set(allTags)].filter(t => t !== 'Mat' && t !== 'FAQ').sort();
  return ['FAQ', ...unique];
}

const TAG_ICON_MAP: Record<string, string> = {
  'Barnens Nyhem': 'Users',
  'Nyhem Ung': 'Zap',
  'Radio Nyhem': 'Radio',
  'Bön': 'Heart',
  'Möte': 'Heart',
  'Musik': 'Music',
  'Nätverksträff': 'Handshake',
  'Seminarium': 'Mic',
  'Sport': 'Footprints',
  'Webb-TV': 'Tv',
  'Young Adults': 'Users',
  'Workshop': 'Wrench',
};

export function getEventIcon(event: AppEvent): string {
  const firstTag = event.tags[0]?.name;
  if (firstTag && TAG_ICON_MAP[firstTag]) {
    return TAG_ICON_MAP[firstTag];
  }
  if (event.category === 'send') return 'Radio';
  if (event.category === 'open') return 'DoorOpen';
  return 'Mic';
}
