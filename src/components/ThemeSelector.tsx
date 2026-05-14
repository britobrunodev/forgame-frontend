import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  return (
    <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
      <SelectTrigger
        aria-label="Theme"
        className="h-9 w-9 rounded-lg border-border bg-secondary/60 p-0 shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 flex items-center justify-center [&>svg.lucide-chevron-down]:hidden"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border bg-gradient-card p-1.5 text-foreground shadow-card backdrop-blur-xl">
        <SelectItem
          value="light"
          className="rounded-lg py-2 pl-8 pr-3 text-xs font-semibold tracking-wide text-foreground focus:bg-primary/15 focus:text-primary-glow"
        >
          <span className="flex items-center gap-2"><Sun className="h-3.5 w-3.5" /> Light</span>
        </SelectItem>
        <SelectItem
          value="dark"
          className="rounded-lg py-2 pl-8 pr-3 text-xs font-semibold tracking-wide text-foreground focus:bg-primary/15 focus:text-primary-glow"
        >
          <span className="flex items-center gap-2"><Moon className="h-3.5 w-3.5" /> Dark</span>
        </SelectItem>
        <SelectItem
          value="system"
          className="rounded-lg py-2 pl-8 pr-3 text-xs font-semibold tracking-wide text-foreground focus:bg-primary/15 focus:text-primary-glow"
        >
          <span className="flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> System</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
