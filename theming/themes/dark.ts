import { Theme } from '../Theme';

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: 'hsl(240 10% 3.9%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(240 10% 3.9%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(240 10% 3.9%)',
    popoverForeground: 'hsl(0 0% 98%)',
    primary: 'hsl(351 64% 55%)', // #ac2839 lighter for dark mode
    primaryForeground: 'hsl(0 0% 98%)',
    secondary: 'hsl(204 100% 40%)', // #0163aa lighter for dark mode
    secondaryForeground: 'hsl(0 0% 98%)',
    tertiary: 'hsl(204 100% 40%)',
    tertiaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(240 3.7% 15.9%)',
    mutedForeground: 'hsl(240 5% 64.9%)',
    accent: 'hsl(240 3.7% 15.9%)',
    accentForeground: 'hsl(0 0% 98%)',
    success: 'hsl(142 70.6% 50%)', // lighter for dark mode
    successForeground: 'hsl(0 0% 98%)',
    warning: 'hsl(45 100% 51%)',
    warningForeground: 'hsl(0 0% 98%)',
    destructive: 'hsl(0 72% 55%)', // lighter for dark mode
    destructiveForeground: 'hsl(0 0% 98%)',
    border: 'hsl(240 3.7% 15.9%)',
    notification: 'hsl(351 64% 55%)',
    input: 'hsl(240 3.7% 15.9%)',
    ring: 'hsl(351 64% 55%)',
    overlay: 'hsl(0 0% 100%)',
  },
  typography: {
    h1: {
      fontSize: '32px',
      fontFamily: 'Inter_700Bold',
    },
    h2: {
      fontSize: '24px',
      fontFamily: 'Inter_700Bold',
    },
    h3: {
      fontSize: '20px',
      fontFamily: 'Inter_600SemiBold',
    },
    h4: {
      fontSize: '18px',
      fontFamily: 'Inter_600SemiBold',
    },
    h5: {
      fontSize: '16px',
      fontFamily: 'Inter_500Medium',
    },
    h6: {
      fontSize: '14px',
      fontFamily: 'Inter_500Medium',
    },
    body: {
      fontSize: '14px',
      fontFamily: 'Inter_400Regular',
    },
    caption: {
      fontSize: '12px',
      fontFamily: 'Inter_300Light',
    },
    button: {
      fontSize: '16px',
      fontFamily: 'Inter_500Medium',
    },
  },
};

export default darkTheme;
