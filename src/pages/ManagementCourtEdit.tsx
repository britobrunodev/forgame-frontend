import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronDown, ChevronUp, Clock3, Plus, Ruler, Save, Trash2, Wallet, X } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURT_DIMENSIONS, getAllCourts, updateCourt, deleteCourt } from '@/lib/courts-store';

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minute = String(totalMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
});

const ManagementCourtEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const ownedPlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => (currentUser.ownedComplexIds ?? []).includes(place.id)),
    [currentUser.ownedComplexIds],
  );

  const court = useMemo(() => getAllCourts().find((c) => c.id === id) ?? null, [id]);

  const [complexId, setComplexId] = useState(court?.complexId ?? ownedPlaces[0]?.id ?? '');
  const [courtName, setCourtName] = useState(court?.name ?? '');
  const [dimensions, setDimensions] = useState(court?.dimensions ?? COURT_DIMENSIONS[0]);
  const [hourlyRate, setHourlyRate] = useState(String(court?.hourlyRate ?? 120));
  const [monthlyRate, setMonthlyRate] = useState(String(court?.monthlyRate ?? 420));
  const [slotStart, setSlotStart] = useState('08:00');
  const [slotEnd, setSlotEnd] = useState('09:00');
  const [slotOptions, setSlotOptions] = useState(court?.slotOptions ?? []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const nextSlotKey = `${slotStart}-${slotEnd}`;
  const canAddSlot = Boolean(slotStart)
    && Boolean(slotEnd)
    && timeToMinutes(slotEnd) > timeToMinutes(slotStart)
    && !slotOptions.some((slot) => `${slot.start}-${slot.end}` === nextSlotKey);

  const selectedPlace = ownedPlaces.find((place) => place.id === complexId) ?? null;

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('editCourt')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h1 className="font-display text-2xl font-black text-muted-foreground">Court not found</h1>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!selectedPlace || !courtName.trim() || slotOptions.length === 0) return;
    updateCourt(court.id, {
      complexId: selectedPlace.id,
      application: selectedPlace.name,
      name: courtName.trim(),
      dimensions,
      hourlyRate: Number(hourlyRate) || 0,
      monthlyRate: Number(monthlyRate) || 0,
      slotOptions,
    });
    toast({ title: t('courtUpdated'), description: `${courtName.trim()} · ${selectedPlace.name}` });
    navigate('/management');
  };

  const handleDelete = () => {
    deleteCourt(court.id);
    toast({ title: t('courtDeleted'), description: court.name });
    navigate('/management');
  };

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('editCourt')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{court.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-live/30 bg-live/10 text-live transition-smooth hover:border-live/60 hover:bg-live/20"
          title={t('confirmDelete')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedPlace || !courtName.trim() || slotOptions.length === 0}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          title={t('saveChanges')}
        >
          <Save className="h-4 w-4" />
        </button>
      </header>

      {showDeleteConfirm && (
        <div className="rounded-2xl border border-live/30 bg-live/10 p-5">
          <p className="font-semibold text-live">{t('deleteConfirmTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('deleteConfirmDescription')}</p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 rounded-lg bg-live px-4 py-2 text-sm font-bold text-white transition-smooth hover:brightness-110">
              <Trash2 className="h-4 w-4" />
              {t('confirmDelete')}
            </button>
            <button type="button" onClick={() => setShowDeleteConfirm(false)} className="inline-flex items-center rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-semibold transition-smooth hover:bg-secondary">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

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
                    <SelectItem key={place.id} value={place.id}>{place.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('courtNameLabel')}</Label>
              <Input
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
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
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('hourlyRate')}</Label>
              <StepperNumberField value={hourlyRate} onChange={setHourlyRate} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('monthlyRate')}</Label>
              <StepperNumberField value={monthlyRate} onChange={setMonthlyRate} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background/25 p-4">
            <div className="mb-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('availableTimeSlots')}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,140px)_minmax(0,140px)_auto]">
              <Select value={slotStart} onValueChange={setSlotStart}>
                <SelectTrigger className="h-10 border-border bg-background/60 font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time} className="font-mono">{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={slotEnd} onValueChange={setSlotEnd}>
                <SelectTrigger className="h-10 border-border bg-background/60 font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time} className="font-mono">{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => {
                  if (!canAddSlot) return;
                  setSlotOptions((current) => (
                    [...current, { start: slotStart, end: slotEnd }].sort((a, b) => (
                      timeToMinutes(a.start) - timeToMinutes(b.start) || timeToMinutes(a.end) - timeToMinutes(b.end)
                    ))
                  ));
                }}
                disabled={!canAddSlot}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-smooth ${
                  canAddSlot
                    ? 'border border-border bg-secondary hover:border-primary/35'
                    : 'cursor-not-allowed border border-border bg-background/40 text-muted-foreground'
                }`}
              >
                <Plus className="h-4 w-4 text-neon-cyan" />
                {t('addTimeSlot')}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {slotOptions.map((slot) => (
                <div key={`${slot.start}-${slot.end}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-2 text-xs font-semibold">
                  <span>{slot.start} - {slot.end}</span>
                  <button
                    type="button"
                    onClick={() => setSlotOptions((current) => current.filter((s) => s.start !== slot.start || s.end !== slot.end))}
                    className="text-muted-foreground transition-smooth hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
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
            <PreviewRow label={t('availableTimeSlots')} value={slotOptions.map((s) => `${s.start}-${s.end}`).join(' · ') || '-'} />
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
              <Clock3 className="h-4 w-4 text-neon-cyan" />
              {t('availableTimeSlots')}
            </div>
            <p>{t('courtTimeSlotsHint')}</p>
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

const StepperNumberField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="flex h-10 overflow-hidden rounded-lg border border-border bg-background/60">
    <Input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
      className="h-full border-0 bg-transparent pr-0 shadow-none focus-visible:ring-0"
    />
    <div className="flex w-10 flex-col border-l border-border">
      <button type="button" onClick={() => onChange(String((Number(value) || 0) + 1))} className="flex h-1/2 items-center justify-center text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground">
        <ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onChange(String(Math.max(0, (Number(value) || 0) - 1)))} className="flex h-1/2 items-center justify-center border-t border-border text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground">
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default ManagementCourtEdit;
