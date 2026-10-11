import type { Theme } from '../hooks/useTheme';
import { Moon, Sun } from './Icons';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="text-fg-muted hover:text-fg hover:bg-surface-strong grid size-11 place-items-center rounded-full transition-colors"
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}
