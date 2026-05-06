import { Building2, GraduationCap, ShieldCheck, Target } from 'lucide-react';

type RoleKey = 'owner' | 'manager' | 'professor' | 'scorer';

export const StatusBadge = ({
  activeRoles,
  t,
}: {
  activeRoles: RoleKey[];
  t: (key: string) => string;
}) => {
  if (activeRoles.includes('owner')) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-300">
        <Building2 className="h-3 w-3 shrink-0" />
        {t('courtOwner')}
      </span>
    );
  }
  if (activeRoles.includes('manager')) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-pink/30 bg-neon-pink/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neon-pink">
        <ShieldCheck className="h-3 w-3 shrink-0" />
        {t('manager')}
      </span>
    );
  }
  if (activeRoles.includes('professor')) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neon-cyan">
        <GraduationCap className="h-3 w-3 shrink-0" />
        {t('professor')}
      </span>
    );
  }
  if (activeRoles.includes('scorer')) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300">
        <Target className="h-3 w-3 shrink-0" />
        {t('scorer')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-background/40 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
      {t('player')}
    </span>
  );
};
