import { View, FlatList, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEvents, useAd2 } from '@/lib/hooks';
import { AdBanner } from '@/components/AdBanner';
import {
  extractUniqueDays,
  extractTitlesForDay,
  getEventsFromTitle,
  getImgFromTitle,
  getDescriptionFromTitle,
  getLocationIdFromTitle,
  getDefaultDay,
  formatEventTime,
  stripHtml,
} from '@/utils/helpers';
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppEvent } from '@/types';

function FoodCard({
  title,
  openEvents,
  currentDay,
}: {
  title: string;
  openEvents: AppEvent[];
  currentDay: number;
}) {
  const router = useRouter();
  const imgUrl = getImgFromTitle(title, openEvents, currentDay);
  const description = getDescriptionFromTitle(title, openEvents, currentDay);
  const titleEvents = getEventsFromTitle(title, openEvents, currentDay);
  const locationId = getLocationIdFromTitle(title, openEvents, currentDay);

  return (
    <Pressable
      className="flex-1"
      disabled={locationId == null}
      onPress={() => {
        if (locationId != null) router.push(`/location/${locationId}`);
      }}
    >
      <Card className="mb-3 p-3 flex-1">
        {imgUrl && (
          <Image
            source={{ uri: imgUrl }}
            className="w-full h-24 rounded-md mb-2"
            resizeMode="cover"
          />
        )}
        <Text className="text-h4 font-bold mb-1">{title}</Text>
        {description && (
          <Text className="text-caption text-muted-foreground mb-2" numberOfLines={3}>
            {stripHtml(description)}
          </Text>
        )}
        {titleEvents.length > 0 && (
          <View className="mt-1">
            {titleEvents.map((event, index) => (
              <Text key={event.id} className="text-caption text-muted-foreground">
                {formatEventTime(event)}
                {index === 0 && titleEvents.length > 1 ? ' - ' : ''}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export default function FoodScreen() {
  const { data: events, isLoading, error } = useEvents();
  const { data: ad2 } = useAd2();
  const [openEvents, setOpenEvents] = useState<AppEvent[]>([]);
  const [days, setDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const dayPositions = useRef<Map<number, number>>(new Map());
  const dayWidths = useRef<Map<number, number>>(new Map());
  const dayPickerContainerWidth = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const currentDayRef = useRef<number>(0);
  currentDayRef.current = currentDay;

  const centerDayInPicker = (day: number, animated: boolean) => {
    const offset = dayPositions.current.get(day);
    const width = dayWidths.current.get(day);
    const container = dayPickerContainerWidth.current;
    if (offset === undefined || width === undefined || container === 0) return;
    const targetX = Math.max(0, offset + width / 2 - container / 2);
    const doScroll = () => scrollRef.current?.scrollTo({ x: targetX, y: 0, animated });
    setTimeout(doScroll, 0);
    setTimeout(doScroll, 100);
    setTimeout(doScroll, 400);
  };

  const loadData = useCallback(() => {
    if (!events) return;

    const filtered = events.filter((e) => e.category === 'open');
    setOpenEvents(filtered);

    const uniqueDays = extractUniqueDays(filtered);
    setDays(uniqueDays);
  }, [events]);

  useEffect(() => {
    if (currentDay !== 0 || days.length === 0) return;
    const defaultDay = getDefaultDay();
    const validDay = days.includes(defaultDay) ? defaultDay : days[0];
    setCurrentDay(validDay);
  }, [days, currentDay]);

  useEffect(() => {
    if (!currentDay) return;
    centerDayInPicker(currentDay, true);
  }, [currentDay]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDaySelect = useCallback((day: number) => {
    setCurrentDay(day);
  }, []);

  const dayTitles = currentDay > 0 && openEvents.length > 0
    ? extractTitlesForDay(openEvents, currentDay)
    : [];

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
            <Text className="text-body text-destructive">Kunde inte ladda matprogram</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <View className="flex-1 px-4 py-4">
        <Text className="text-h1 mb-2">Mat</Text>
        <Text className="text-body text-muted-foreground mb-4">
          Här hittar du matprogram
        </Text>

        {ad2 && (
          <View className="mb-4">
            <AdBanner ad={ad2} />
          </View>
        )}

        {days.length > 0 && (
          <ScrollView
            ref={scrollRef}
            cssInterop={false}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 16, flexGrow: 0, flexShrink: 0 }}
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
                const eventOnDay = openEvents.find((e) => new Date(e.start_at).getDate() === day);
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
                    onPress={() => handleDaySelect(day)}
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
                      className={`text-caption mt-0.5 ${
                        isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                      }`}>
                      {day} jun
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {dayTitles.length > 0 ? (
          <FlatList
            data={dayTitles}
            keyExtractor={(item) => item}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <FoodCard
                title={item}
                openEvents={openEvents}
                currentDay={currentDay}
              />
            )}
          />
        ) : (
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Inga matställen för vald dag
            </Text>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}