import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@/theming/ThemeProvider';
import LucideIcon from '@/lib/icons/LucideIcon';
import { Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ACTIVE_COLOR = '#ac2839';

export default function TabLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerStatusBarHeight = insets.top > 20 ? insets.top - 12 : insets.top;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: '#ac2839',
          borderBottomColor: theme.colors.border,
        },
        headerStatusBarHeight,
        headerTintColor: '#ffffff',
        headerTitleAlign: 'center',
        headerTitle: () => (
          <Image
            source={require('../../assets/images/header.png')}
            style={{ width: 120, height: 40, resizeMode: 'contain' }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nyhem',
          tabBarIcon: ({ color, size }) => (
            <LucideIcon name="Heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <LucideIcon name="Clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Mat',
          tabBarIcon: ({ color, size }) => (
            <LucideIcon name="UtensilsCrossed" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="allinfo"
        options={{
          title: 'All Information',
          tabBarIcon: ({ color, size }) => (
            <LucideIcon name="Info" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="speakers"
        options={{
          href: null,
          title: 'Talare',
          headerTitle: 'Talare',
          headerLeft: () => (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              hitSlop={12}
              style={{ paddingHorizontal: 12 }}>
              <LucideIcon name="ChevronLeft" size={28} color="#ffffff" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="location" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
