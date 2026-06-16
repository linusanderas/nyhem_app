import { View, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents, useAd2 } from '@/lib/hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';
import { HtmlContent } from '@/components/HtmlContent';
import LucideIcon from '@/lib/icons/LucideIcon';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import {
  formatEventDate,
  formatEventTime,
  getEventIcon,
  isEventLive,
  decodeEntities,
} from '@/utils/helpers';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const eventId = parseInt(id, 10);
  const { data: events, isLoading } = useEvents();
  const { data: ad2 } = useAd2();
  const { favoritedIds, toggleFavorite } = useFavoritesStore();

  const event = events?.find((e) => e.id === eventId) ?? null;
  const isFavorited = event ? favoritedIds.includes(event.id) : false;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <ScrollView className="flex-1 px-4 py-4">
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Programpunkten hittades inte
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const location = event.locations?.[0];
  const live = isEventLive(event);
  const icon = getEventIcon(event);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {location?.imageUrl && (
          <Image
            source={{ uri: location.imageUrl }}
            className="w-full h-56"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                <LucideIcon name={icon} size={20} className="text-primary" />
              </View>
              {live && (
                <Badge variant="default" className="rounded-md">
                  <Text className="text-xs font-bold text-primary-foreground">
                    PÅGÅR
                  </Text>
                </Badge>
              )}
            </View>
            <Pressable
              onPress={() => toggleFavorite(event.id)}
              hitSlop={12}
              className="p-1"
            >
              <LucideIcon
                name="Heart"
                size={24}
                className={isFavorited ? 'text-primary' : 'text-muted-foreground'}
                fill={isFavorited ? '#ac2839' : 'none'}
              />
            </Pressable>
          </View>

          <Text className="text-h1 mb-2">{decodeEntities(event.title)}</Text>

          <Text className="text-body text-primary font-semibold mb-3">
            {formatEventDate(event)} · {formatEventTime(event)}
          </Text>

          {location && (
            <Pressable
              onPress={() => router.push(`/location/${location.id}`)}
              className="flex-row items-center gap-2 mb-3"
            >
              <LucideIcon name="MapPin" size={16} className="text-muted-foreground" />
              <Text className="text-body underline">{location.title}</Text>
            </Pressable>
          )}

          {event.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mb-3">
              {event.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  style={{ backgroundColor: tag.color, borderColor: tag.color }}
                >
                  <Text className="text-xs text-white">{tag.name}</Text>
                </Badge>
              ))}
            </View>
          )}

          {event.text && (
            <View className="mt-2">
              <HtmlContent html={event.text} />
            </View>
          )}

          {event.speakers.length > 0 && (
            <View className="mt-6">
              <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
                {event.speakers.length === 1 ? 'TALARE' : 'TALARE'}
              </Text>
              {event.speakers.map((speaker) => (
                <Pressable
                  key={speaker.id}
                  onPress={() => router.push(`/speaker/${speaker.id}`)}
                >
                  <Card className="p-3 mb-2 flex-row items-center gap-3">
                    {speaker.imageUrl ? (
                      <Image
                        source={{ uri: speaker.imageUrl }}
                        className="w-12 h-12 rounded-full bg-muted"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-primary/15 items-center justify-center">
                        <Text className="text-sm font-bold text-primary">
                          {getInitials(speaker.title)}
                        </Text>
                      </View>
                    )}
                    <Text className="text-body font-semibold flex-1" numberOfLines={1}>
                      {decodeEntities(speaker.title)}
                    </Text>
                    <LucideIcon
                      name="ChevronRight"
                      size={20}
                      className="text-muted-foreground"
                    />
                  </Card>
                </Pressable>
              ))}
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
