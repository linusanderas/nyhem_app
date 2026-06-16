import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePages } from '@/lib/hooks';
import { useAd2 } from '@/lib/hooks';
import { useRouter } from 'expo-router';
import { AppPage } from '@/types';
import { filterInfoPages, extractInfoTags } from '@/utils/helpers';
import { useState, useCallback, memo } from 'react';
import { useFocusEffect } from 'expo-router';
import { AdBanner } from '@/components/AdBanner';

const InfoCard = memo(function InfoCard({ page }: { page: AppPage }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/info/${page.id}`)}>
      <Card className="mb-2 p-4">
        {page.is_approved === false && (
          <View className="bg-destructive px-3 py-1.5 rounded mb-2 -mx-1">
            <Text className="text-caption text-white font-bold text-center">
              Preliminär info
            </Text>
          </View>
        )}
        <Text className="text-h4 font-bold">{page.title}</Text>
      </Card>
    </Pressable>
  );
});

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
    console.log('[allinfo] tag pressed:', tag);
    setCurrentTag(tag);
  };

  console.log('[allinfo] render', { currentTag, tagListLen: tagList.length, pagesToShowLen: pagesToShow.length });

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
      <ScrollView
        cssInterop={false}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}>
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
          <View className="flex-row flex-wrap gap-2 mb-4">
            {tagList.map((item) => {
              const selected = item === currentTag;
              return (
                <Pressable
                  key={item}
                  onPress={() => handleTagPress(item)}
                  style={{
                    backgroundColor: selected ? '#ac2839' : 'transparent',
                    borderColor: selected ? '#ac2839' : '#e5e5e5',
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                  <Text style={{ color: selected ? '#ffffff' : '#18181b', fontSize: 13, fontWeight: '600' }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {pagesToShow.length > 0 ? (
          pagesToShow.map((item) => <InfoCard key={item.id} page={item} />)
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
      </ScrollView>
    </SafeAreaView>
  );
}