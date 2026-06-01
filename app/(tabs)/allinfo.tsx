import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePages } from '@/lib/hooks';
import { useAd2 } from '@/lib/hooks';
import { useRouter } from 'expo-router';
import { AppPage } from '@/types';
import { filterInfoPages, extractInfoTags } from '@/utils/helpers';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';

function InfoCard({ page, showExcerpt }: { page: AppPage; showExcerpt: boolean }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/info/${page.id}`)}>
      <Card className="mb-3 p-4">
        {page.is_approved === false && (
          <View className="bg-destructive px-3 py-1.5 rounded mb-2 -mx-1">
            <Text className="text-caption text-white font-bold text-center">
              Preliminär info
            </Text>
          </View>
        )}
        <Text className="text-h4 font-bold flex-1">{page.title}</Text>
        {page.tags && page.tags.length > 0 && (
          <View className="mt-2 mb-2 flex-row flex-wrap gap-1">
            {page.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}>
                <Text className="text-white">{tag.name}</Text>
              </Badge>
            ))}
          </View>
        )}
        {showExcerpt && page.text && (
          <Text className="text-body text-muted-foreground mt-2" numberOfLines={2}>
            {page.text}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

export default function AllInfoScreen() {
  const { data: pages, isLoading, error } = usePages();
  const { data: ad2 } = useAd2();
  const [currentTag, setCurrentTag] = useState('FAQ');
  const [tagList, setTagList] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (pages) {
        const filtered = pages.filter((p) => p.category === 'page');
        const tags = extractInfoTags(filtered);
        setTagList(tags);
      }
    }, [pages])
  );

  const allPages = pages ? pages.filter((p) => p.category === 'page') : [];
  const pagesToShow = filterInfoPages(allPages, currentTag);

  const handleTagPress = (tag: string) => {
    setCurrentTag(tag);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1 items-center justify-center px-4">
          <Card className="p-4 border-destructive">
            <Text className="text-body text-destructive">Kunde inte ladda info</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <View className="flex-1 px-4 py-4">
        <Text className="text-h1 mb-2">All Information</Text>
        <Text className="text-body text-muted-foreground mb-4">
          Viktig information och praktiska detaljer
        </Text>

        {ad2 && (
          <View className="mb-4">
            <AdBanner ad={ad2} />
          </View>
        )}

        {tagList.length > 0 && (
          <View className="mb-4 -mx-4 px-4">
            <FlatList
              horizontal
              data={tagList}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleTagPress(item)} className="mr-2">
                  <Badge
                    variant={item === currentTag ? 'default' : 'outline'}
                    className="px-3 py-1"
                    style={item === currentTag ? { backgroundColor: '#ac2839' } : undefined}>
                    {item}
                  </Badge>
                </Pressable>
              )}
            />
          </View>
        )}

        {pagesToShow.length > 0 ? (
          <FlatList
            data={pagesToShow}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isLongList = pagesToShow.length >= 5;
              const showExcerpt = isLongList
                ? index >= 4 || index === pagesToShow.length - 1
                : true;
              return <InfoCard page={item} showExcerpt={showExcerpt} />;
            }}
          />
        ) : (
          <Card className="p-4">
            <Text className="text-body text-muted-foreground text-center">
              Ingen information tillgänglig
            </Text>
          </Card>
        )}

        <Card className="mt-4 p-4 bg-muted">
          <Text className="text-h4 mb-2">Frågor?</Text>
          <Text className="text-body text-muted-foreground">
            Kontakta oss på info@nyhemsveckan.se eller fråga personalen på plats.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}