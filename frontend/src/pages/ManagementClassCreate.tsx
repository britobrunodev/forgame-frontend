import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Check, Users } from 'lucide-react';
import { MANAGED_PLAYERS, RESERVATION_PLACES, SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClassSlot, PlayerLevel, SportId } from '@/types';

type EnrollmentMode = 'all' | 'select';

const classStorageKey = 'joga-junto-management-classes';
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Weekday = (typeof weekdays)[number];
type ScheduleMode = 'weekly' | 'specific';

const levelOptions: PlayerLevel[] = ['beginner', 'intermediate', 'advanced', 'silver', 'gold', 'professional'];

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (d: Date, locale: string) =>
  d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

const ManagementClassCreate = () => {
  const navigate = useNavigate();
  const { t, sportName, language } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];

  const ownedPlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id)),
    [ownedComplexIds],
  );

  const ownedPlayers = useMemo(
    () => MANAGED_PLAYERS.filter((player) => ownedComplexIds.includes(player.complexId)),
    [ownedComplexIds],
  );

  const [complexId, setComplexId] = useState(ownedPlaces[0]?.id ?? '');
  const [sportId, setSportId] = useState<SportId>('footvolley');
  const [professorId, setProfessorId] = useState(ownedPlayers[0]?.id ?? '');
  const [level, setLevel] = useState<PlayerLevel>('intermediate');

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('weekly');
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday>('monday');
  const [specificDate, setSpecificDate] = useState<Date>(new Date());

  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [maxSpots, setMaxSpots] = useState('10');

  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>('all');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((current) =>
      current.includes(id) ? current.filter((pid) => pid !== id) : [...current, id],
    );
  };

  useEffect(() => {
    if (!complexId && ownedPlaces.length > 0) setComplexId(ownedPlaces[0].id);
  }, [ownedPlaces, complexId]);

  useEffect(() => {
    if (!professorId && ownedPlayers.length > 0) setProfessorId(ownedPlayers[0].id);
  }, [ownedPlayers, professorId]);

  const selectedComplex = ownedPlaces.find((p) => p.id === complexId);
  const selectedProfessor = ownedPlayers.find((p) => p.id === professorId);

  const dateLabel =
    scheduleMode === 'weekly'
      ? t(selectedWeekday)
      : `${toDateStr(specificDate)} · ${t(weekdays[specificDate.getDay() === 0 ? 6 : specificDate.getDay() - 1])}`;

  const handleCreate = () => {
    if (!selectedComplex || !selectedProfessor) return;
    const newClass: ClassSlot = {
      id: `class-${Date.now()}`,
      complexId: selectedComplex.id,
      complexName: selectedComplex.name,
      sport: sportId,
      professorName: selectedProfessor.name,
      date: dateLabel,
      startTime,
      endTime,
      maxSpots: Number(maxSpots) || 0,
      bookedSpots: 0,
      level,
      enrolledPlayerIds: enrollmentMode === 'select' ? selectedPlayerIds : null,
    };
    try {
      const stored = window.localStorage.getItem(classStorageKey);
      const current = stored ? (JSON.parse(stored) as ClassSlot[]) : [];
      window.localStorage.setItem(classStorageKey, JSON.stringify([newClass, ...current]));
    } catch {
      window.localStorage.setItem(classStorageKey, JSON.stringify([newClass]));
    }
    toast({
      title: t('classCreated'),
      description: `${selectedComplex.name} · ${selectedProfessor.name} · ${dateLabel} ${startTime}–${endTime}`,
    });
    navigate('/management/classes');
  };

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('createClass')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(88rem,calc(100vw-2rem))] space-y-8">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/classes')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('createClass')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('managementClassesIntro')}</p>
        </div>
      </header>

      <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        {/* Basic info */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Select value={sportId} onValueChange={(v) => setSportId(v as SportId)}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {SPORTS.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>{sportName(sport.id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('professor')}>
            <Select value={professorId} onValueChange={setProfessorId}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {ownedPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('difficultyLevel')}>
            <Select value={level} onValueChange={(v) => setLevel(v as PlayerLevel)}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {levelOptions.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{t(lvl)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Schedule */}
        <div className="mt-6 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('weekSchedule')}</div>

          {/* Mode toggle */}
          <div className="mb-5 flex gap-2">
            <ModeBtn
              active={scheduleMode === 'weekly'}
              onClick={() => setScheduleMode('weekly')}
              label={t('weekSchedule')}
            />
            <ModeBtn
              active={scheduleMode === 'specific'}
              onClick={() => setScheduleMode('specific')}
              label={t('customDate')}
            />
          </div>

          {/* Weekly day selector */}
          <div className={scheduleMode === 'specific' ? 'pointer-events-none opacity-40' : ''}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('weekSchedule')}</div>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => {
                const short = t(day).slice(0, 3).toUpperCase();
                const active = scheduleMode === 'weekly' && selectedWeekday === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => { setScheduleMode('weekly'); setSelectedWeekday(day); }}
                    className={`min-w-[48px] rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-smooth ${
                      active
                        ? 'border-primary/50 bg-primary/15 text-primary-glow shadow-glow'
                        : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Specific date */}
          <div className={scheduleMode === 'weekly' ? 'pointer-events-none opacity-40' : ''}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('customDate')}</div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => setScheduleMode('specific')}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary/70"
                >
                  <CalendarIcon className="h-4 w-4 text-neon-cyan" />
                  {formatDisplayDate(specificDate, locale)}
                  <span className="ml-1 text-xs text-muted-foreground">
                    · {t(weekdays[specificDate.getDay() === 0 ? 6 : specificDate.getDay() - 1]).slice(0, 3).toUpperCase()}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                <CalendarPicker
                  mode="single"
                  selected={specificDate}
                  onSelect={(d) => { if (d) { setSpecificDate(d); setScheduleMode('specific'); } }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Time + capacity */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label={t('reservationStartTime')}>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border-border bg-background/60"
            />
          </Field>
          <Field label={t('reservationEndTime')}>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-border bg-background/60"
            />
          </Field>
          <Field label={t('spotCapacity')}>
            <Input
              type="number"
              min={1}
              value={maxSpots}
              onChange={(e) => setMaxSpots(e.target.value)}
              className="border-border bg-background/60"
            />
          </Field>
        </div>

        {/* Enrolled players */}
        <div className="mt-5 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neon-cyan" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('enrolledPlayers')}</span>
            </div>
            <div className="flex gap-2">
              <ModeBtn active={enrollmentMode === 'all'} onClick={() => setEnrollmentMode('all')} label={t('allPlayers')} />
              <ModeBtn active={enrollmentMode === 'select'} onClick={() => setEnrollmentMode('select')} label={t('selectPlayers')} />
            </div>
          </div>
          <div className={enrollmentMode === 'all' ? 'pointer-events-none opacity-40' : ''}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ownedPlayers.map((player) => {
                const checked = selectedPlayerIds.includes(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs transition-smooth ${
                      checked
                        ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-neon-cyan bg-neon-cyan/20' : 'border-border'}`}>
                      {checked && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{player.name}</span>
                      <span className="block truncate text-[10px] opacity-70">{player.email}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {enrollmentMode === 'select' && selectedPlayerIds.length === 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">{t('selectPlayers')}</p>
            )}
          </div>
          {enrollmentMode === 'all' && (
            <p className="text-xs text-muted-foreground">{t('allPlayers')}</p>
          )}
        </div>

        {/* Preview + submit */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedComplex?.name ?? '–'}</span>
            {' · '}
            <span>{selectedProfessor?.name ?? '–'}</span>
            {' · '}
            <span className="text-neon-cyan">{dateLabel}</span>
            {' · '}
            <span>{startTime}–{endTime}</span>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!selectedComplex || !selectedProfessor}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('createClass')}
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

const ModeBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-smooth ${
      active
        ? 'border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan'
        : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    }`}
  >
    {label}
  </button>
);

export default ManagementClassCreate;
