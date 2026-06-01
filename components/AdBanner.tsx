import { Pressable, Image } from 'react-native';
import * as Linking from 'expo-linking';
import { Ad } from '@/types';

export function AdBanner({ ad }: { ad: Ad | null | undefined }) {
  if (!ad) return null;

  return (
    <Pressable onPress={() => Linking.openURL(ad.link)}>
      <Image
        source={{ uri: ad.image }}
        className="h-40 w-full rounded-lg"
        resizeMode="cover"
      />
    </Pressable>
  );
}
