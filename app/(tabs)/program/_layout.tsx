import { Stack, useRouter } from 'expo-router';
import { Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theming/ThemeProvider';
import LucideIcon from '@/lib/icons/LucideIcon';

export default function ProgramLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerStatusBarHeight = insets.top > 20 ? insets.top - 12 : insets.top;
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ac2839',
          borderBottomColor: theme.colors.border,
        },
        headerStatusBarHeight,
        headerTintColor: '#ffffff',
        headerTitleAlign: 'center',
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Image
              source={require('../../../assets/images/header.png')}
              style={{ width: 120, height: 40, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          title: 'Programpunkt',
          headerLeft: () => (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/program'))}
              hitSlop={12}
              style={{ paddingHorizontal: 12 }}>
              <LucideIcon name="ChevronLeft" size={28} color="#ffffff" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
