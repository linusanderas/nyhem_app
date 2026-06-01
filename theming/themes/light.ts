import { Theme } from '../Theme';

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(240 10% 3.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(240 10% 3.9%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(240 10% 3.9%)',
    primary: 'hsl(351 64% 49%)', // #ac2839
    primaryForeground: 'hsl(0 0% 98%)',
    secondary: 'hsl(204 100% 34%)', // #0163aa
    secondaryForeground: 'hsl(0 0% 98%)',
    tertiary: 'hsl(204 100% 34%)',
    tertiaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(240 4.8% 95.9%)',
    mutedForeground: 'hsl(240 3.8% 46.1%)',
    accent: 'hsl(240 4.8% 95.9%)',
    accentForeground: 'hsl(240 5.9% 10%)',
    success: 'hsl(142 70.6% 35%)', // #009600
    successForeground: 'hsl(0 0% 98%)',
    warning: 'hsl(45 100% 51%)',
    warningForeground: 'hsl(0 0% 98%)',
    destructive: 'hsl(0 72% 35%)', // #5a0000
    destructiveForeground: 'hsl(0 0% 98%)',
    border: 'hsl(240 5.9% 90%)',
    notification: 'hsl(351 64% 49%)',
    input: 'hsl(240 5.9% 90%)',
    ring: 'hsl(351 64% 49%)',
    overlay: 'hsl(0 0% 0%)',
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

export default lightTheme;
