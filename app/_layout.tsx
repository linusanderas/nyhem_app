import '@/global.css';
import '@/appearance-polyfill';

import {
  Theme as NavigationTheme,
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, View, Image } from 'react-native';
import { ThemeProvider, useTheme } from '@/theming/ThemeProvider';
import lightTheme from '@/theming/themes/light';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { PortalHost } from '@rn-primitives/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebPortalContext } from '@/components/WebPortalContext';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initNotifications } from '@/lib/notifications';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function RootContent() {
  const hasMounted = React.useRef(false);
  const [portalContainer, setPortalContainer] = React.useState<View | null>(null);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerStatusBarHeight = insets.top > 20 ? insets.top - 12 : insets.top;
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const isLoadingFonts = !fontsLoaded && !fontError;

  const navigationTheme: NavigationTheme = React.useMemo(() => {
    const navigationThemeBase = NavigationDefaultTheme;
    const baseColors = navigationThemeBase.colors;
    return {
      ...navigationThemeBase,
      colors: {
        ...baseColors,
        background: theme.colors.background ?? baseColors.background,
        border: theme.colors.border ?? baseColors.border,
        card: theme.colors.card ?? baseColors.card,
        notification: theme.colors.destructive ?? baseColors.notification,
        primary: theme.colors.primary ?? baseColors.primary,
        text: theme.colors.foreground ?? baseColors.text,
      },
    };
  }, [theme]);

  React.useEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    initNotifications();
    useFavoritesStore.getState().loadFromStorage();
    hasMounted.current = true;
  }, []);

  // Set CSS color variables on document root for web
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value.startsWith('hsl(')) {
          const stripped = value.replace('hsl(', '').replace(')', '');
          document.documentElement.style.setProperty(`--${key}`, stripped);
        }
      });
    }
  }, [theme]);

  React.useEffect(() => {
    if (!isLoadingFonts) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingFonts]);

  if (!isColorSchemeLoaded || isLoadingFonts) {
    return null;
  }

  return (
    <WebPortalContext.Provider value={{ container: portalContainer as unknown as HTMLElement | null }}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={() => ({
            headerStyle: {
              backgroundColor: '#ac2839',
              borderBottomColor: theme.colors.border,
            },
            headerStatusBarHeight,
            headerTintColor: '#ffffff',
            headerTitleAlign: 'center',
            headerTitle: () => (
              <Image
                source={require('../assets/images/header.png')}
                style={{ width: 120, height: 40, resizeMode: 'contain' }}
              />
            ),
            headerRight: () => null,
            headerBackTitle: '',
            headerBackButtonDisplayMode: 'minimal',
          })}>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="speaker/[id]"
            options={{
              title: 'Föreläsare',
              headerBackTitle: '',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: 'Info',
              headerBackTitle: '',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
        </Stack>
        {
          // View used as a portal container on web
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
            ref={setPortalContainer}
          />
        }
        {
          // PortalHost used as a portal container on native
          <PortalHost />
        }
      </NavigationThemeProvider>
    </WebPortalContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        initialThemeName="light"
        themes={[lightTheme]}>
        <RootContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
