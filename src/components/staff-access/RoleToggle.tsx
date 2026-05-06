import type { ReactNode } from 'react';

type Tone = 'cyan' | 'pink' | 'amber' | 'violet';

const activeToneClasses: Record<Tone, string> = {
  cyan: 'border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan)/0.3)]',
  pink: 'border-neon-pink/50 bg-neon-pink/15 text-neon-pink shadow-[0_0_8px_hsl(var(--neon-pink)/0.3)]',
  amber: 'border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-[0_0_8px_rgb(251_191_36/0.3)]',
  violet: 'border-violet-400/50 bg-violet-400/15 text-violet-300 shadow-[0_0_8px_rgb(167_139_250/0.3)]',
};

const activeChipToneClasses: Record<Tone, string> = {
  cyan: 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan',
  pink: 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink',
  amber: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
  violet: 'border-violet-400/40 bg-violet-400/15 text-violet-300',
};

export const RoleIconToggle = ({
  active,
  icon,
  tone,
  title,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  tone: Tone;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-smooth ${
      active ? activeToneClasses[tone] : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    }`}
  >
    {icon}
  </button>
);

export const RoleChipToggle = ({
  active,
  icon,
  tone,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  tone: Tone;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-smooth ${
      active ? activeChipToneClasses[tone] : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    }`}
  >
    {icon}
    {label}
  </button>
);
