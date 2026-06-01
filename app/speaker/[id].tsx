import { View, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePages, useEvents } from '@/lib/hooks';
import { useAd2 } from '@/lib/hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';
import { HtmlContent } from '@/components/HtmlContent';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import {
  getEventsForSpeaker,
  formatEventDate,
  formatEventTime,
  getEventIcon,
  stripHtml,
  decodeEntities,
} from '@/utils/helpers';

export default function SpeakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const speakerId = parseInt(id, 10);
  const { data: pages, isLoading } = usePages();
  const { data: events } = useEvents();
  const { data: ad2 } = useAd2();

  const speaker = pages?.find((p) => p.id === speakerId) ?? null;
  const speakerEvents = events ? getEventsForSpeaker(events, speakerId) : [];
  const { favoritedIds, toggleFavorite } = useFavoritesStore();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!speaker) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1 px-4 py-4">
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Föreläsare hittades inte
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {speaker.imageUrl && (
          <Image
            source={{ uri: speaker.imageUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4">
          <Text className="text-h1 mb-4">{speaker.title}</Text>

          {speaker.text ? (
            <HtmlContent html={speaker.text} />
          ) : (
            <Text className="text-body text-muted-foreground italic">
              Ingen beskrivning tillgänglig.
            </Text>
          )}

          {speakerEvents.length > 0 && (
            <View className="mt-6">
              <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
                TALAR PÅ
              </Text>
              {speakerEvents.map((event) => {
                const location = event.locations?.[0];
                const icon = getEventIcon(event);
                const description = stripHtml(event.text);
                const isFavorited = favoritedIds.includes(event.id);
                return (
                  <Pressable
                    key={event.id}
                    onPress={() => router.push(`/event/${event.id}`)}
                  >
                    <Card className="p-3 mb-2 flex-row items-start gap-3">
                      <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                        <LucideIcon name={icon} size={18} className="text-primary" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-body font-semibold" numberOfLines={1}>
                          {decodeEntities(event.title)}
                        </Text>
                        <Text className="text-caption text-primary font-semibold mt-0.5">
                          {formatEventDate(event)} · {formatEventTime(event)}
                        </Text>
                        {location && (
                          <View className="flex-row items-center gap-1 mt-0.5">
                            <LucideIcon
                              name="MapPin"
                              size={12}
                              className="text-muted-foreground"
                            />
                            <Text
                              className="text-caption text-muted-foreground"
                              numberOfLines={1}
                            >
                              {location.title}
                            </Text>
                          </View>
                        )}
                        {description.length > 0 && (
                          <Text
                            className="text-caption text-muted-foreground mt-2"
                            numberOfLines={3}
                          >
                            {description}
                          </Text>
                        )}
                        {event.tags.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap gap-1">
                            {event.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                style={{
                                  backgroundColor: tag.color,
                                  borderColor: tag.color,
                                }}
                              >
                                <Text className="text-xs text-white">{tag.name}</Text>
                              </Badge>
                            ))}
                          </View>
                        )}
                      </View>
                      <Pressable
                        onPress={() => toggleFavorite(event.id)}
                        hitSlop={12}
                        className="p-1"
                      >
                        <LucideIcon
                          name="Heart"
                          size={20}
                          className={
                            isFavorited ? 'text-primary' : 'text-muted-foreground'
                          }
                          fill={isFavorited ? '#ac2839' : 'none'}
                        />
                      </Pressable>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
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
