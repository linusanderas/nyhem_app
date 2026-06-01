import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theming/ThemeProvider';

export default function LocationLayout() {
  const { theme } = useTheme();
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
      <Stack.Screen name="[id]" options={{ title: 'Plats' }} />
    </Stack>
  );
}
