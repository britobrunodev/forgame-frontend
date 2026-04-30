import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Ruler, Wallet } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURT_DIMENSIONS, saveCustomCourt } from '@/lib/courts-store';

const CourtCreate = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const ownedPlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => (currentUser.ownedComplexIds ?? []).includes(place.id)),
    [currentUser.ownedComplexIds],
  );

  const [complexId, setComplexId] = useState(ownedPlaces[0]?.id ?? '');
  const [courtName, setCourtName] = useState('');
  const [dimensions, setDimensions] = useState(COURT_DIMENSIONS[0]);
  const [hourlyRate, setHourlyRate] = useState('120');
  const [monthlyRate, setMonthlyRate] = useState('420');

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('createCourt')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  const selectedPlace = ownedPlaces.find((place) => place.id === complexId) ?? null;

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('addCourt')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('createCourtIntro')}</p>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</Label>
              <Select value={complexId} onValueChange={setComplexId}>
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue placeholder={t('selectComplex')} />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {ownedPlaces.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('courtNameLabel')}</Label>
              <Input
                id="court-name"
                value={courtName}
                onChange={(event) => setCourtName(event.target.value)}
                placeholder={t('courtNamePlaceholder')}
                className="border-border bg-background/60"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('dimensions')}</Label>
              <Select value={dimensions} onValueChange={setDimensions}>
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {COURT_DIMENSIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly-rate" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('hourlyRate')}</Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(event) => setHourlyRate(event.target.value)}
                className="border-border bg-background/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-rate" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('monthlyRate')}</Label>
              <Input
                id="monthly-rate"
                type="number"
                min="0"
                value={monthlyRate}
                onChange={(event) => setMonthlyRate(event.target.value)}
                className="border-border bg-background/60"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                if (!selectedPlace || !courtName.trim()) return;
                saveCustomCourt({
                  id: `custom-${Date.now()}`,
                  complexId: selectedPlace.id,
                  application: selectedPlace.name,
                  name: courtName.trim(),
                  dimensions,
                  hourlyRate: Number(hourlyRate) || 0,
                  monthlyRate: Number(monthlyRate) || 0,
                  reservations: [],
                });
                toast({
                  title: t('courtCreated'),
                  description: `${courtName.trim()} · ${selectedPlace.name}`,
                });
                navigate('/management');
              }}
              disabled={!selectedPlace || !courtName.trim()}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.18em] transition-smooth ${
                selectedPlace && courtName.trim()
                  ? 'bg-gradient-primary shadow-neon hover:brightness-110'
                  : 'cursor-not-allowed border border-border bg-secondary text-muted-foreground'
              }`}
            >
              {t('addCourt')}
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('quickPreview')}</h2>
          </div>

          <div className="space-y-3 text-sm">
            <PreviewRow label={t('sportComplex')} value={selectedPlace?.name ?? '-'} />
            <PreviewRow label={t('courtNameLabel')} value={courtName.trim() || '-'} />
            <PreviewRow label={t('dimensions')} value={dimensions} />
            <PreviewRow
              label={t('hourlyRate')}
              value={new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(Number(hourlyRate) || 0)}
            />
            <PreviewRow
              label={t('monthlyRate')}
              value={new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(Number(monthlyRate) || 0)}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
              <Ruler className="h-4 w-4 text-neon-cyan" />
              {t('dimensions')}
            </div>
            <p>{t('dimensionsHint')}</p>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-neon-cyan" />
              {t('payment')}
            </div>
            <p>{t('courtPricingHint')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/30 p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold text-foreground">{value}</div>
  </div>
);

export default CourtCreate;
