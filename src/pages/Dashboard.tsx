import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClipboardList, MapPin, Trophy } from 'lucide-react';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const levelColors: Record<string, string> = {
  beginner: 'border-muted-foreground/40 bg-muted-foreground/10 text-muted-foreground',
  'high-beginner': 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  intermediate: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan',
  'high-intermediate': 'border-primary/40 bg-primary/10 text-primary-glow',
  advanced: 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink',
  'high-advanced': 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
  professional: 'border-live/40 bg-live/10 text-live',
};

const Dashboard = () => {
  const { t, sportName } = useLanguage();
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const initials = useMemo(
    () => currentUser.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2),
    [currentUser.name],
  );

  const levelColor = levelColors[currentUser.level ?? 'beginner'] ?? levelColors.beginner;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-card shadow-card">
        <div className="relative px-4 py-5 sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,72,126,0.14),transparent_40%)]" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <div className="rounded-full bg-[conic-gradient(from_140deg,_rgba(255,72,126,0.9),_rgba(0,245,255,0.95),_rgba(255,72,126,0.9))] p-[2.5px]">
                <Avatar className="h-16 w-16 border-2 border-background sm:h-20 sm:w-20">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-primary font-display text-base font-bold text-primary-foreground sm:text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary dark:text-[#39E600]">{t('playerFeed')}</p>
              <h1 className="mt-0.5 truncate font-display text-xl font-black leading-tight sm:text-2xl">
                {currentUser.nickname
                  ? <><span className="text-foreground/70">{t('hey')},</span> <span className="neon-text">{currentUser.nickname}</span></>
                  : <span className="text-foreground/70">{t('hey')}!</span>}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentUser.level && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${levelColor}`}>
                    <Trophy className="h-2.5 w-2.5" />
                    {t(currentUser.level)}
                  </span>
                )}
                {(currentUser.preferences ?? []).map((sportId) => (
                  <span key={sportId} className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    <SportIcon sportId={sportId} className="h-2.5 w-2.5" />
                    {sportName(sportId)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <StatBlock label={t('wins')} value={String(currentUser.wins ?? 0)} accent="text-neon-cyan" />
            <StatBlock label={t('draws')} value={String(currentUser.draws ?? 0)} accent="text-primary-glow" />
            <StatBlock label={t('losses')} value={String(currentUser.losses ?? 0)} accent="text-neon-pink" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        <QuickAction icon={<Trophy className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />} label={t('championships')} onClick={() => navigate('/championships')} />
        <QuickAction icon={<MapPin className="h-4 w-4 text-neon-pink sm:h-5 sm:w-5" />} label={t('reservations')} onClick={() => navigate('/reservations')} disabled />
        <QuickAction icon={<ClipboardList className="h-4 w-4 text-live sm:h-5 sm:w-5" />} label={t('mySchedule')} onClick={() => navigate('/bookings')} />
      </section>
    </div>
  );
};

const StatBlock = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-xl border border-border bg-background/35 p-2 text-center sm:rounded-2xl sm:p-3">
    <div className={`font-display text-xl font-black sm:text-2xl ${accent}`}>{value}</div>
    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">{label}</div>
  </div>
);

const QuickAction = ({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-gradient-card p-2.5 text-center transition-smooth sm:gap-2 sm:p-3 ${disabled ? 'cursor-not-allowed opacity-40 select-none' : 'hover:border-primary/30 hover:bg-secondary/60'}`}
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background/40 sm:h-10 sm:w-10">
      {icon}
    </div>
    <span className="line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-muted-foreground sm:text-[10px] sm:tracking-[0.15em]">{label}</span>
  </button>
);

export default Dashboard;
