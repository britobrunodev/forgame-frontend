import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, Trash2 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getChampionships, updateChampionship, deleteChampionship } from '@/lib/championships-store';
import type { ManagedChampionship } from '@/types';

const toDateValue = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromDateValue = (value: string) => new Date(`${value}T12:00:00`);

const ManagementChampionshipEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, sportName, language } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];

  const ownedPlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id)),
    [ownedComplexIds],
  );

  const champ = useMemo(() => getChampionships().find((c) => c.id === id) ?? null, [id]);

  const [name, setName] = useState(champ?.name ?? '');
  const [complexId, setComplexId] = useState(champ?.complexId ?? ownedPlaces[0]?.id ?? '');
  const [teamsCount, setTeamsCount] = useState(String(champ?.teamsCount ?? 16));
  const [status, setStatus] = useState<ManagedChampionship['status']>(champ?.status ?? 'upcoming');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    champ ? { from: fromDateValue(champ.startDate), to: fromDateValue(champ.endDate) } : undefined,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedComplex = ownedPlaces.find((p) => p.id === complexId);

  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from) return '-';
    const start = dateRange.from.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!dateRange.to) return start;
    const end = dateRange.to.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${start} - ${end}`;
  }, [dateRange, locale]);

  const handleSave = () => {
    if (!name.trim() || !selectedComplex || !dateRange?.from) return;
    updateChampionship(champ!.id, {
      name: name.trim(),
      complexId: selectedComplex.id,
      teamsCount: Number(teamsCount) || 0,
      status,
      startDate: toDateValue(dateRange.from),
      endDate: toDateValue(dateRange.to ?? dateRange.from),
    });
    notify.success(t('championshipUpdated'), name.trim());
    navigate('/management/championships');
  };

  const handleDelete = () => {
    deleteChampionship(champ!.id);
    notify.success(t('championshipDeleted'), champ?.name);
    navigate('/management/championships');
  };

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('editChampionship')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h1 className="font-display text-2xl font-black text-muted-foreground">Championship not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(88rem,calc(100vw-2rem))] space-y-8">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/championships')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('editChampionship')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{champ.name}</p>
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
          disabled={!name.trim() || !selectedComplex || !dateRange?.from}
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

      <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t('tournamentName')}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('tournamentNamePlaceholder')}
              className="border-border bg-background/60"
            />
          </Field>

          <Field label={t('sportComplex')}>
            <Select value={complexId} onValueChange={setComplexId}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {ownedPlaces.map((place) => (
                  <SelectItem key={place.id} value={place.id}>{place.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('sport')}>
            <div className="flex h-10 items-center rounded-lg border border-border bg-background/40 px-3 text-sm font-semibold text-muted-foreground">
              {sportName(champ.sport)}
            </div>
          </Field>

          <Field label={t('eventDate')}>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
                >
                  <Calendar className="h-4 w-4 text-neon-cyan" />
                  <span>{formattedDateRange}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                <CalendarPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field label={t('bracketSize')}>
            <Input
              type="number"
              min={2}
              value={teamsCount}
              onChange={(e) => setTeamsCount(e.target.value)}
              className="border-border bg-background/60"
            />
          </Field>

          <Field label="Status">
            <Select value={status} onValueChange={(v) => setStatus(v as ManagedChampionship['status'])}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="upcoming">{t('upcoming')}</SelectItem>
                <SelectItem value="live">{t('live')}</SelectItem>
                <SelectItem value="finished">{t('finished')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{name.trim() || '–'}</span>
            {' · '}
            <span>{selectedComplex?.name ?? '–'}</span>
            {' · '}
            <span className="text-neon-cyan">{formattedDateRange}</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !selectedComplex || !dateRange?.from}
            title={t('saveChanges')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    {children}
  </div>
);

export default ManagementChampionshipEdit;
