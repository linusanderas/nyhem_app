import { View, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useEvents, usePages } from '@/lib/hooks';
import { useRouter, useFocusEffect } from 'expo-router';
import { extractSpeakersByDay, SpeakerWithSessions, getDebugDate } from '@/utils/helpers';
import { useRef, useCallback, useEffect } from 'react';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function SpeakerRow({
  speaker,
  onPress,
}: {
  speaker: SpeakerWithSessions;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card className="p-3 mb-2 flex-row items-start gap-3">
        {speaker.imageUrl ? (
          <Image
            source={{ uri: speaker.imageUrl }}
            className="w-12 h-12 rounded-full bg-muted"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-primary/15 items-center justify-center">
            <Text className="text-sm font-bold text-primary">
              {getInitials(speaker.name)}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-body font-semibold" numberOfLines={1}>
            {speaker.name}
          </Text>
          {speaker.subtitle && (
            <Text className="text-caption text-muted-foreground" numberOfLines={1}>
              {speaker.subtitle}
            </Text>
          )}
          {speaker.sessions.length > 0 && (
            <Text className="text-caption text-primary mt-1" numberOfLines={2}>
              {speaker.sessions.join(' · ')}
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

export default function SpeakersScreen() {
  const router = useRouter();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: pages, isLoading: pagesLoading } = usePages();

  const scrollRef = useRef<ScrollView>(null);
  const groupPositions = useRef<Map<number, number>>(new Map());
  const needsScroll = useRef(true);
  const today = getDebugDate().getDate();

  const groups = !eventsLoading && !pagesLoading
    ? extractSpeakersByDay(events ?? [], pages ?? [])
    : [];

  const tryScrollToToday = () => {
    if (!needsScroll.current) return;
    if (groups.length === 0) return;
    if (!scrollRef.current) return;
    const days = groups.map((g) => g.day);
    const targetDay = days.includes(today)
      ? today
      : days.find((d) => d >= today) ?? days[days.length - 1];
    const y = groupPositions.current.get(targetDay);
    if (y == null) return;
    needsScroll.current = false;
    scrollRef.current.scrollTo({ x: 0, y: Math.max(0, y - 8), animated: false });
  };

  useFocusEffect(
    useCallback(() => {
      needsScroll.current = true;
    }, [])
  );

  useEffect(() => {
    if (groups.length === 0) return;
    if (!needsScroll.current) return;
    const timers = [50, 150, 300, 600, 1200].map((delay) =>
      setTimeout(tryScrollToToday, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [groups.length]);

  if (eventsLoading || pagesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const weekdays = [
    'Söndag',
    'Måndag',
    'Tisdag',
    'Onsdag',
    'Torsdag',
    'Fredag',
    'Lördag',
  ];
  const months = [
    'januari',
    'februari',
    'mars',
    'april',
    'maj',
    'juni',
    'juli',
    'augusti',
    'september',
    'oktober',
    'november',
    'december',
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <ScrollView
        ref={scrollRef}
        cssInterop={false}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={tryScrollToToday}
      >
        {groups.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" className="mb-4" />
            <Text className="text-body text-muted-foreground">
              Laddar talare...
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View
              key={group.day}
              className="mb-6"
              onLayout={(e) => {
                groupPositions.current.set(group.day, e.nativeEvent.layout.y);
                tryScrollToToday();
              }}
            >
              <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
                {weekdays[group.date.getDay()].toUpperCase()} {group.day}{' '}
                {months[group.date.getMonth()].toUpperCase()}
              </Text>
              {group.speakers.map((speaker) => (
                <SpeakerRow
                  key={speaker.id}
                  speaker={speaker}
                  onPress={() => router.push(`/speaker/${speaker.id}`)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
