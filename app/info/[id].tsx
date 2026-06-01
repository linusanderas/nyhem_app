import { View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { usePages } from '@/lib/hooks';
import { useAd2 } from '@/lib/hooks';
import { useLocalSearchParams } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';
import { HtmlContent } from '@/components/HtmlContent';

export default function InfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pageId = parseInt(id, 10);
  const { data: pages, isLoading } = usePages();
  const { data: ad2 } = useAd2();

  const page = pages?.find((p) => p.id === pageId) ?? null;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!page) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1 px-4 py-4">
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Information hittades inte
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {page.is_approved === false && (
          <View className="bg-destructive px-3 py-1.5">
            <Text className="text-caption text-white font-bold text-center">
              Preliminär info
            </Text>
          </View>
        )}

        {page.imageUrl && (
          <Image
            source={{ uri: page.imageUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4">
          <Text className="text-h1 mb-4">{page.title}</Text>

          {page.text && <HtmlContent html={page.text} />}

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
