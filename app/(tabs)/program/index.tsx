import { View, ScrollView, Pressable, ActivityIndicator, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/lib/hooks';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import { router } from 'expo-router';
import LucideIcon from '@/lib/icons/LucideIcon';
import { AppEvent } from '@/types';
import {
  formatEventTime,
  filterProgramEvents,
  extractUniqueDays,
  extractUniqueTags,
  getEventOpacity,
  getDefaultDay,
  getEventIcon,
  getDebugDate,
} from '@/utils/helpers';
import { useState, useEffect, useRef } from 'react';

const SELECTED_TAB_STYLE = {
  backgroundColor: '#ffffff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
} as const;

const PRIMARY_TINT_BG = { backgroundColor: 'rgba(172, 40, 57, 0.1)' } as const;
const PRIMARY_FOREGROUND_SOFT = { color: 'rgba(250, 250, 250, 0.9)' } as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function EventCard({
  event,
  isFavorited,
  onToggleFavorite,
  onPress,
}: {
  event: AppEvent;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  const speaker = event.speakers?.[0];
  const location = event.locations?.[0];
  const categoryIcon = getEventIcon(event);

  return (
    <Pressable onPress={onPress} style={{ opacity: getEventOpacity(event) }}>
      <Card className="mb-3 p-4">
        <View className="flex-row items-start gap-3">
          <View
            style={PRIMARY_TINT_BG}
            className="w-11 h-11 rounded-lg items-center justify-center">
            <LucideIcon name={categoryIcon} size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-primary font-semibold">{formatEventTime(event)}</Text>
            {location && (
              <Pressable
                onPress={() => router.push(`/location/${location.id}`)}
                className="flex-row items-center gap-1 mt-0.5">
                <LucideIcon name="MapPin" size={14} className="text-muted-foreground" />
                <Text className="text-caption text-muted-foreground">{location.title}</Text>
              </Pressable>
            )}
          </View>
          <Pressable onPress={onToggleFavorite} className="p-1">
            <LucideIcon
              name="Heart"
              size={20}
              className={isFavorited ? 'text-primary' : 'text-muted-foreground'}
              fill={isFavorited ? '#ac2839' : 'none'}
            />
          </Pressable>
        </View>

        <Text className="text-h4 font-bold mt-3">{event.title}</Text>

        {speaker && (
          <Pressable
            onPress={() => router.push(`/speaker/${speaker.id}`)}
            className="flex-row items-center gap-2 mt-3">
            {speaker.imageUrl ? (
              <Image
                source={{ uri: speaker.imageUrl }}
                className="w-7 h-7 rounded-full bg-muted"
              />
            ) : (
              <View className="w-7 h-7 rounded-full bg-muted items-center justify-center">
                <Text className="text-xs font-semibold text-muted-foreground">
                  {getInitials(speaker.title)}
                </Text>
              </View>
            )}
            <Text className="text-body">{speaker.title}</Text>
          </Pressable>
        )}

        {event.text && (
          <Text className="text-caption text-muted-foreground mt-3" numberOfLines={2}>
            {event.text.replace(/<[^>]*>/g, '')}
          </Text>
        )}

        {event.tags.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}>
                <Text className="text-xs text-white">{tag.name}</Text>
              </Badge>
            ))}
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export default function ProgramScreen() {
  const { data: events, isLoading, error } = useEvents();
  const favoritedIds = useFavoritesStore((s) => s.favoritedIds);
  const showFavorites = useFavoritesStore((s) => s.showFavorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const setShowFavoritesFilter = useFavoritesStore((s) => s.setShowFavoritesFilter);
  const [showSend, setShowSend] = useState(true);

  const days = events ? extractUniqueDays(events) : [];
  const tags = events ? extractUniqueTags(events) : [];
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const dayPositions = useRef<Map<number, number>>(new Map());
  const dayWidths = useRef<Map<number, number>>(new Map());
  const dayPickerContainerWidth = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const currentDayRef = useRef<number | null>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const eventPositions = useRef<Map<number, number>>(new Map());
  const pendingScrollEventId = useRef<number | null>(null);
  const initialScrollDone = useRef(false);

  currentDayRef.current = currentDay;

  const filteredEvents = events
    ? filterProgramEvents(events, currentDay, [], showFavorites, favoritedIds, showSend)
    : [];

  const dayEventCount = events && currentDay
    ? filterProgramEvents(events, currentDay, [], false, [], showSend).length
    : 0;
  const dayFavoriteCount = events && currentDay
    ? filterProgramEvents(events, currentDay, [], true, favoritedIds, showSend).length
    : 0;

  const centerDayInPicker = (day: number, animated: boolean) => {
    const offset = dayPositions.current.get(day);
    const width = dayWidths.current.get(day);
    const container = dayPickerContainerWidth.current;
    if (offset === undefined || width === undefined || container === 0) return;
    const targetX = Math.max(0, offset + width / 2 - container / 2);
    scrollRef.current?.scrollTo({ x: targetX, y: 0, animated });
  };

  const tryInitialScroll = () => {
    if (initialScrollDone.current) return;
    const targetId = pendingScrollEventId.current;
    if (targetId == null) return;
    const cardY = eventPositions.current.get(targetId);
    if (cardY == null) return;
    if (!contentScrollRef.current) return;
    initialScrollDone.current = true;
    contentScrollRef.current.scrollTo({ x: 0, y: cardY, animated: true });
  };

  const handleDayPress = (day: number) => {
    if (day === currentDay) return;
    setCurrentDay(day);
    requestAnimationFrame(() => {
      contentScrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  useEffect(() => {
    if (currentDay || days.length === 0) return;
    const defaultDay = getDefaultDay();
    const validDay = days.includes(defaultDay) ? defaultDay : days[0];
    setCurrentDay(validDay);
  }, [days, currentDay]);

  useEffect(() => {
    if (!currentDay) return;
    centerDayInPicker(Number(currentDay), true);
  }, [currentDay]);

  useEffect(() => {
    if (initialScrollDone.current) return;
    if (!currentDay || filteredEvents.length === 0) return;

    const today = getDebugDate().getDate();
    if (currentDay !== today) {
      initialScrollDone.current = true;
      return;
    }

    const now = getDebugDate().getTime();
    const upcoming = filteredEvents.find((e) => new Date(e.end_at).getTime() > now);
    if (!upcoming) {
      initialScrollDone.current = true;
      return;
    }
    pendingScrollEventId.current = upcoming.id;
    tryInitialScroll();
  }, [currentDay, filteredEvents.length]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" className="mb-4" />
          <Text className="text-body text-muted-foreground">Laddar data från servern...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center px-4">
          <Card className="p-4 border-destructive">
            <Text className="text-body text-destructive">Kunde inte ladda program</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-h1 mb-4">Program</Text>

        <View className="flex-row bg-muted rounded-full p-1 mb-4">
          <Pressable
            onPress={() => setShowFavoritesFilter(false)}
            accessibilityRole="button"
            accessibilityState={{ selected: !showFavorites }}
            style={!showFavorites ? SELECTED_TAB_STYLE : undefined}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full py-2.5">
            <LucideIcon
              name="CalendarDays"
              size={16}
              color={!showFavorites ? '#ac2839' : '#71717a'}
            />
            <Text
              style={{ color: !showFavorites ? '#18181b' : '#71717a' }}
              className="text-sm font-semibold">
              Alla programpunkter
            </Text>
            <View
              style={{ backgroundColor: !showFavorites ? '#ac2839' : '#ffffff' }}
              className="rounded-full px-2 py-0.5 min-w-[24px] items-center">
              <Text
                style={{ color: !showFavorites ? '#ffffff' : '#71717a' }}
                className="text-xs font-bold">
                {dayEventCount}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setShowFavoritesFilter(true)}
            accessibilityRole="button"
            accessibilityState={{ selected: showFavorites }}
            style={showFavorites ? SELECTED_TAB_STYLE : undefined}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full py-2.5">
            <LucideIcon
              name="Heart"
              size={16}
              color={showFavorites ? '#ac2839' : '#71717a'}
              fill={showFavorites ? '#ac2839' : 'none'}
            />
            <Text
              style={{ color: showFavorites ? '#18181b' : '#71717a' }}
              className="text-sm font-semibold">
              Mina favoriter
            </Text>
            <View
              style={{ backgroundColor: showFavorites ? '#ac2839' : '#ffffff' }}
              className="rounded-full px-2 py-0.5 min-w-[24px] items-center">
              <Text
                style={{ color: showFavorites ? '#ffffff' : '#71717a' }}
                className="text-xs font-bold">
                {dayFavoriteCount}
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 mb-4">
          <Switch
            value={showSend}
            onValueChange={setShowSend}
            trackColor={{ true: '#ac2839', false: '#888' }}
          />
          <Text className="text-body">Inkludera sändningar</Text>
        </View>

        {days.length > 0 && (
          <ScrollView
            ref={scrollRef}
            cssInterop={false}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
            onLayout={(e) => {
              dayPickerContainerWidth.current = e.nativeEvent.layout.width;
              const day = currentDayRef.current;
              if (day) centerDayInPicker(day, false);
            }}
            onContentSizeChange={() => {
              const day = currentDayRef.current;
              if (day) centerDayInPicker(day, false);
            }}>
            <View className="flex-row gap-2">
              {days.map((day) => {
                const eventOnDay = events?.find((e) => new Date(e.start_at).getDate() === day);
                const date = eventOnDay ? new Date(eventOnDay.start_at) : new Date();
                const weekdays = [
                  'Söndag',
                  'Måndag',
                  'Tisdag',
                  'Onsdag',
                  'Torsdag',
                  'Fredag',
                  'Lördag',
                ];
                const weekday = weekdays[date.getDay()];
                const isSelected = day === currentDay;
                return (
                  <Pressable
                    key={day}
                    onPress={() => handleDayPress(day)}
                    onLayout={(e) => {
                      dayPositions.current.set(day, e.nativeEvent.layout.x);
                      dayWidths.current.set(day, e.nativeEvent.layout.width);
                      if (day === currentDayRef.current) {
                        centerDayInPicker(day, false);
                      }
                    }}
                    className={`rounded-2xl px-6 py-3 items-center min-w-[96px] ${
                      isSelected ? 'bg-primary' : 'bg-muted'
                    }`}>
                    <Text
                      className={`font-bold text-base ${
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                      {weekday}
                    </Text>
                    <Text
                      style={isSelected ? PRIMARY_FOREGROUND_SOFT : undefined}
                      className={`text-caption mt-0.5 ${
                        isSelected ? '' : 'text-muted-foreground'
                      }`}>
                      {day} jun
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      <ScrollView
        ref={contentScrollRef}
        cssInterop={false}
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => tryInitialScroll()}>
        {filteredEvents.length > 0 ? (
          <View
            onLayout={() => {
              tryInitialScroll();
            }}>
          {filteredEvents.map((event) => (
            <View
              key={event.id}
              onLayout={(e) => {
                eventPositions.current.set(event.id, e.nativeEvent.layout.y);
                tryInitialScroll();
              }}>
              <EventCard
                event={event}
                isFavorited={favoritedIds.includes(event.id)}
                onToggleFavorite={() => toggleFavorite(event.id)}
                onPress={() => router.push(`/program/event/${event.id}`)}
              />
            </View>
          ))}
          </View>
        ) : (
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              {showFavorites ? 'Inga favoriter ännu' : 'Inga evenemang'}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
