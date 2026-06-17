import { Pressable, Image, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Ad } from '@/types';

export function AdBanner({ ad }: { ad: Ad | null | undefined }) {
  if (!ad) return null;

  return (
    <View className="w-full overflow-hidden rounded-lg bg-muted">
      <Pressable onPress={() => Linking.openURL(ad.link)}>
        <Image
          source={{ uri: ad.image }}
          className="w-full"
          resizeMode="contain"
          style={{ aspectRatio: 16 / 9 }}
        />
      </Pressable>
    </View>
  );
}
