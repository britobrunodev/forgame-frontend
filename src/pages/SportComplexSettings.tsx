import { useMemo, useState } from 'react';
import { Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { DragSelectField } from '@/components/DragSelectField';
import { SportIcon } from '@/components/SportIcon';
import { CURRENT_USER, SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

type SportOption = 'footvolley' | 'beach-tennis' | 'beach-soccer' | 'volleyball';
const SPORT_ORDER: SportOption[] = ['footvolley', 'beach-tennis', 'beach-soccer', 'volleyball'];

const SportComplexSettings = () => {
  const { t, sportName } = useLanguage();
  const { toast } = useToast();
  const [complexName, setComplexName] = useState('Arena Joga Junto Copacabana');
  const [city, setCity] = useState('Rio de Janeiro');
  const [selectedSports, setSelectedSports] = useState<SportOption[]>(['footvolley', 'beach-tennis']);

  const availableSports = useMemo(
    () => SPORT_ORDER.filter((sport) => !selectedSports.includes(sport)),
    [selectedSports],
  );

  if (CURRENT_USER.type !== 'distributor') {
    return (
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('createSportComplex')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  const moveSport = (sportId: SportOption, nextState: 'selected' | 'available') => {
    setSelectedSports((current) => {
      const withoutCurrent = current.filter((item) => item !== sportId);
      if (nextState === 'selected') {
        return [...withoutCurrent, sportId].sort((left, right) => SPORT_ORDER.indexOf(left) - SPORT_ORDER.indexOf(right));
      }
      return withoutCurrent;
    });
  };

  const handleCreate = () => {
    toast({
      title: t('sportComplexPublished'),
      description: `${complexName} · ${city}`,
    });
  };

  return (
    <div className="max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">{t('settingsAccess')}</p>
          <h1 className="font-display text-4xl font-black">
            <span className="neon-text">{t('sportComplexBuilder')}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('sportComplexBuilderIntro')}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('complexName')}>
              <Input
                value={complexName}
                onChange={(event) => setComplexName(event.target.value)}
                placeholder={t('complexNamePlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('city')}>
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('cityPlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>
          </div>

          <div className="mt-5">
            <DragSelectField
              label={t('sportsAvailable')}
              hint={t('dragSportsHint')}
              availableTitle={t('availableSports')}
              selectedTitle={t('selectedSports')}
              availableItems={availableSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
              selectedItems={selectedSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
              onMove={(id, nextState) => moveSport(id as SportOption, nextState)}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110"
            >
              <Building2 className="h-4 w-4" />
              {t('createSportComplex')}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('quickPreview')}</h2>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-background/40 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">{t('sportComplexBuilder')}</div>
              <h3 className="mt-2 font-display text-2xl font-black leading-tight">{complexName}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <PreviewRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} label={t('city')} value={city} />
                <PreviewRow icon={<Building2 className="h-4 w-4 text-neon-cyan" />} label={t('sportsAvailable')} value={String(selectedSports.length)} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedSports.map((sportId) => (
                  <span key={sportId} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow">
                    <SportIcon sportId={sportId} className="h-3.5 w-3.5" />
                    {sportName(sportId)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('sportsAvailable')}</h2>
            </div>
            <div className="space-y-3">
              {SPORTS.map((sport) => (
                <div key={sport.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4">
                  <SportIcon sportId={sport.id} className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{sportName(sport.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

const PreviewRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  </div>
);

export default SportComplexSettings;
