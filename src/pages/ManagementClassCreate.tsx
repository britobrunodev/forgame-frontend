import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Check, Plus } from 'lucide-react';
import { MANAGED_PLAYERS, RESERVATION_PLACES, SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClassSlot, PlayerLevel, SportId } from '@/types';

const classStorageKey = 'joga-junto-management-classes';
const todayStr = new Date().toISOString().slice(0, 10);
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Weekday = (typeof weekdays)[number];
type ScheduleOption = Weekday | 'specific';

const levelOptions: PlayerLevel[] = ['beginner', 'intermediate', 'advanced', 'silver', 'gold', 'professional'];

const getWeekdayFromDate = (value: string): Weekday | '' => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const dayIndex = parsed.getDay();
    return weekdays[dayIndex === 0 ? 6 : dayIndex - 1];
};

const ManagementClassCreate = () => {
    const navigate = useNavigate();
    const { t, sportName } = useLanguage();
    const { isGestorMode, currentUser } = useSession();
    const { toast } = useToast();
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
    const [scheduleOption, setScheduleOption] = useState<ScheduleOption>('monday');
    const [date, setDate] = useState(todayStr); const [selectedDate, setSelectedDate] = useState<Date>(new Date()); const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [maxSpots, setMaxSpots] = useState('10');
    const [level, setLevel] = useState<PlayerLevel>('intermediate');

    useEffect(() => {
        if (!complexId && ownedPlaces.length > 0) {
            setComplexId(ownedPlaces[0].id);
        }
    }, [ownedPlaces, complexId]);

    useEffect(() => {
        if (!professorId && ownedPlayers.length > 0) {
            setProfessorId(ownedPlayers[0].id);
        }
    }, [ownedPlayers, professorId]);

    const selectedComplex = ownedPlaces.find((place) => place.id === complexId);
    const selectedProfessor = ownedPlayers.find((player) => player.id === professorId);
    const specificDateWeekday = scheduleOption === 'specific' ? getWeekdayFromDate(date) : '';

    const handleCreateClass = () => {
        if (!selectedComplex || !selectedProfessor) return;
        const scheduleLabel = scheduleOption === 'specific'
            ? `${date}${specificDateWeekday ? ` (${t(specificDateWeekday)})` : ''}`
            : t(scheduleOption);

        const newClass: ClassSlot = {
            id: `class-${Date.now()}`,
            complexId: selectedComplex.id,
            complexName: selectedComplex.name,
            sport: sportId,
            professorName: selectedProfessor.name,
            date: scheduleLabel,
            startTime,
            endTime,
            maxSpots: Number(maxSpots) || 0,
            bookedSpots: 0,
            level,
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
            description: `${selectedComplex.name} · ${selectedProfessor.name} · ${scheduleLabel} ${startTime}–${endTime}`,
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
        <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
            <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('createClass')}</p>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementClassesIntro')}</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/management/classes')}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-secondary/70 px-4 text-sm font-semibold text-neon-cyan shadow-neon transition-smooth hover:border-neon-cyan/50 hover:bg-secondary"
                >
                    <Plus className="h-4 w-4" />
                    {t('managementClasses')}
                </button>
            </header>

            <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
                        <Select value={complexId} onValueChange={setComplexId}>
                            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                                {ownedPlaces.map((place) => (
                                    <SelectItem key={place.id} value={place.id}>{place.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sport')}</div>
                        <Select value={sportId} onValueChange={(value) => setSportId(value as SportId)}>
                            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                                {SPORTS.map((sport) => (
                                    <SelectItem key={sport.id} value={sport.id}>{sportName(sport.id)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('professor')}</div>
                        <Select value={professorId} onValueChange={setProfessorId}>
                            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                                {ownedPlayers.map((player) => (
                                    <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('weekSchedule')}</div>
                        <Select value={scheduleOption} onValueChange={(value) => setScheduleOption(value as ScheduleOption)}>
                            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                                {weekdays.map((weekdayOption) => (
                                    <SelectItem key={weekdayOption} value={weekdayOption}>{t(weekdayOption)}</SelectItem>
                                ))}
                                <SelectItem value="specific">{t('date')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {scheduleOption === 'specific' ? (
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('customDate')}</div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-background/60 px-4 text-sm font-semibold text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary/70"
                                    >
                                        <span>{new Intl.DateTimeFormat('default', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedDate)}</span>
                                        <CalendarIcon className="h-4 w-4 text-neon-cyan" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                                    <CalendarPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(nextDate) => {
                                            if (!nextDate) return;
                                            setSelectedDate(nextDate);
                                            const year = nextDate.getFullYear();
                                            const month = String(nextDate.getMonth() + 1).padStart(2, '0');
                                            const day = String(nextDate.getDate()).padStart(2, '0');
                                            setDate(`${year}-${month}-${day}`);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {specificDateWeekday ? (
                                <p className="text-xs text-muted-foreground">{t('weekday')}: {t(specificDateWeekday)}</p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('weekday')}</div>
                            <div className="rounded-lg border border-border bg-background/60 px-3 py-3 text-sm text-foreground">{t(scheduleOption)}</div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('reservationStartTime')}</div>
                        <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="border-border bg-background/60 text-sm" />
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('reservationEndTime')}</div>
                        <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="border-border bg-background/60 text-sm" />
                    </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('spotCapacity')}</div>
                        <Input
                            type="number"
                            min={1}
                            value={maxSpots}
                            onChange={(event) => setMaxSpots(event.target.value)}
                            className="border-border bg-background/60 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleCreateClass}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-primary px-4 text-sm font-semibold uppercase tracking-[0.12em] text-foreground shadow-neon transition-smooth hover:brightness-110"
                        >
                            {t('createClass')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementClassCreate;
