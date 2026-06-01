import { useEffect } from 'react';
import { useTheme } from '@/theming/ThemeProvider';

export function HtmlContent({ html }: { html: string }) {
  const { theme } = useTheme();

  useEffect(() => {
    const el = document.querySelector('.html-content-render');
    if (el) {
      el.innerHTML = html;
    }
  }, [html]);

  return (
    <div
      className="html-content-render text-body text-muted-foreground leading-relaxed break-words"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        color: theme.colors.mutedForeground,
      }}
    />
  );
}
