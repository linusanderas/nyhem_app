import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useTheme } from '@/theming/ThemeProvider';

const systemFonts = ['Inter_400Regular', 'Inter_600SemiBold', 'Inter_700Bold'];

export function HtmlContent({ html }: { html: string }) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  const tagsStyles = {
    body: { color: theme.colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
    p: { color: theme.colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 8 },
    a: { color: theme.colors.primary, textDecorationLine: 'none' as const },
    strong: { fontFamily: 'Inter_700Bold', color: theme.colors.foreground },
    b: { fontFamily: 'Inter_700Bold', color: theme.colors.foreground },
    ul: { color: theme.colors.mutedForeground, fontSize: 14, marginBottom: 8 },
    ol: { color: theme.colors.mutedForeground, fontSize: 14, marginBottom: 8 },
    li: { color: theme.colors.mutedForeground, fontSize: 14, marginBottom: 4 },
    h1: { fontFamily: 'Inter_700Bold', fontSize: 24, color: theme.colors.foreground, marginBottom: 8 },
    h2: { fontFamily: 'Inter_700Bold', fontSize: 20, color: theme.colors.foreground, marginBottom: 8 },
    h3: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: theme.colors.foreground, marginBottom: 8 },
  };

  return (
    <RenderHtml
      contentWidth={width - 32}
      source={{ html }}
      tagsStyles={tagsStyles}
      systemFonts={systemFonts}
    />
  );
}
