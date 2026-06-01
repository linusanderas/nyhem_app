import { View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useLocalSearchParams } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';
import { HtmlContent } from '@/components/HtmlContent';
import { useEvents, useAd2 } from '@/lib/hooks';
import { getDescriptionFromTitle, getImgFromTitle, getEventsFromTitle, formatEventTime, stripHtml, getTodayWeekdayPossessive } from '@/utils/helpers';
import { getStoredEvents } from '@/lib/storage';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function FoodDetailScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const { data: ad2 } = useAd2();
  const [openEvents, setOpenEvents] = useState<any[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const events = await getStoredEvents();
        const filtered = events.filter((e) => e.category === 'open');
        setOpenEvents(filtered);
        if (filtered.length > 0) {
          setCurrentDay(new Date(filtered[0].start_at).getDate());
        }
      };
      loadData();
    }, [])
  );

  if (!title) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1 px-4 py-4">
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Matställe hittades inte
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const imgUrl = getImgFromTitle(decodeURIComponent(title), openEvents, currentDay);
  const description = getDescriptionFromTitle(decodeURIComponent(title), openEvents, currentDay);
  const titleEvents = getEventsFromTitle(decodeURIComponent(title), openEvents, currentDay);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {imgUrl && (
          <Image
            source={{ uri: imgUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4">
          <Text className="text-h1 mb-4">{decodeURIComponent(title)}</Text>

          {description && (
            <Text className="text-body text-muted-foreground mb-4">
              {stripHtml(description)}
            </Text>
          )}

          {titleEvents.length > 0 && (
            <Card className="p-4">
              <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
                {getTodayWeekdayPossessive()} ÖPPETT
              </Text>
              {titleEvents.map((event, index) => (
                <Text key={event.id} className="text-body">
                  {formatEventTime(event)}
                </Text>
              ))}
            </Card>
          )}

          {ad2 && (
            <View className="mt-4">
              <AdBanner ad={ad2} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}