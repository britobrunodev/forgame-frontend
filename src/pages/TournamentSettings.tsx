import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Calendar, CircleDollarSign, PlusCircle, ShieldCheck, Sparkles, Trash2, Trophy } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { RESERVATION_PLACES } from '@/data/mock';
import { BackgroundUploadField } from '@/components/BackgroundUploadField';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSession } from '@/session';

type TournamentType = 'open-pairs' | 'mixed-pairs' | 'king-of-the-court';
type Category = 'professional' | 'gold' | 'silver' | 'advanced' | 'intermediate' | 'beginner';
type BracketSize = '8' | '16' | '32';
type Audience = 'mixed' | 'male' | 'female';
type ChampFormat = 'dupla-fechada' | 'cumbuca' | 'rei-da-praia';
type CategoryEntry = { id: string; format: ChampFormat; category: Category; audience: Audience; date: string; time: string };

const CATEGORY_ORDER: Category[] = ['beginner', 'intermediate', 'advanced', 'silver', 'gold', 'professional'];
const AUDIENCE_OPTIONS: Audience[] = ['mixed', 'male', 'female'];
const START_TIME_OPTIONS = ['08:00', '09:00', '10:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateValue = (value: string) => new Date(`${value}T12:00:00`);

const buildDateOptions = (range: DateRange | undefined) => {
  if (!range?.from) return [];

  const start = new Date(range.from);
  start.setHours(12, 0, 0, 0);

  const end = range.to ? new Date(range.to) : new Date(range.from);
  end.setHours(12, 0, 0, 0);

  const values: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    values.push(toDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return values;
};

let nextEntryId = 2;
const makeEntryId = () => String(nextEntryId++);

const TournamentSettings = () => {
  const { t, sportName, language } = useLanguage();
  const { currentUser, isGestorMode } = useSession();
  const { toast } = useToast();
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const ownerComplexes = useMemo(
    () =>
      RESERVATION_PLACES.filter(
        (place) =>
          currentUser.applications?.includes(place.name) &&
          place.sports.includes('footvolley'),
      ),
    [currentUser.applications],
  );

  const [tournamentName, setTournamentName] = useState('Copa Joga Junto Footvolley');
  const [sport, setSport] = useState<'footvolley'>('footvolley');
  const [tournamentType, setTournamentType] = useState<TournamentType>('open-pairs');
  const [categoryEntries, setCategoryEntries] = useState<CategoryEntry[]>([
    { id: '1', format: 'dupla-fechada' as ChampFormat, category: 'professional', audience: 'mixed', date: '2026-05-20', time: '15:00' },
  ]);
  const [uniformIncluded, setUniformIncluded] = useState(true);
  const [eventDateRange, setEventDateRange] = useState<DateRange | undefined>({
    from: fromDateValue('2026-05-18'),
    to: fromDateValue('2026-05-20'),
  });
  const [registrationDeadline, setRegistrationDeadline] = useState(fromDateValue('2026-05-12'));
  const [complexId, setComplexId] = useState(ownerComplexes[0]?.id ?? '');
  const [entryFee, setEntryFee] = useState('180');
  const [bracketSize, setBracketSize] = useState<BracketSize>('16');
  const [transmissionUrl, setTransmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');
  const [selectedBackgroundOffsetY, setSelectedBackgroundOffsetY] = useState(0);

  const selectedComplex = ownerComplexes.find((complex) => complex.id === complexId) ?? ownerComplexes[0];
  const eventDateOptions = useMemo(() => buildDateOptions(eventDateRange), [eventDateRange]);
  const formattedEventDate = useMemo(() => {
    if (!eventDateRange?.from) return '-';

    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const start = eventDateRange.from.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (!eventDateRange.to) return start;

    const end = eventDateRange.to.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${start} - ${end}`;
  }, [eventDateRange, language]);
  const formattedRegistrationDeadline = useMemo(
    () =>
      registrationDeadline.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [language, registrationDeadline],
  );

  useEffect(() => {
    const defaultDate = eventDateOptions[0] ?? '';
    setCategoryEntries((current) =>
      current.map((entry) => ({
        ...entry,
        date: entry.date && eventDateOptions.includes(entry.date) ? entry.date : defaultDate,
      })),
    );
  }, [eventDateOptions]);

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('tournament')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  const tournamentTypeLabel = {
    'open-pairs': t('openPairs'),
    'mixed-pairs': t('mixedPairs'),
    'king-of-the-court': t('kingOfTheCourt'),
  }[tournamentType];

  const addEntry = () => {
    setCategoryEntries((current) => [
      ...current,
      {
        id: makeEntryId(),
        format: 'dupla-fechada' as ChampFormat,
        category: 'beginner',
        audience: 'mixed',
        date: eventDateOptions[0] ?? '',
        time: START_TIME_OPTIONS[0],
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setCategoryEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof Omit<CategoryEntry, 'id'>, value: string) => {
    setCategoryEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    );
  };

  const handleDraft = () => {
    toast({
      title: t('draftSaved'),
      description: `${tournamentName} · ${selectedComplex?.name ?? '-'}`,
    });
  };

  const handlePublish = () => {
    toast({
      title: t('tournamentPublished'),
      description: `${tournamentName} · ${selectedComplex?.name ?? '-'}`,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('tournamentBuilder')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('tournamentBuilderIntro')}</p>
        </div>
        <button
          type="button"
          onClick={handleDraft}
          title={t('saveDraft')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('tournamentName')}>
              <Input
                value={tournamentName}
                onChange={(event) => setTournamentName(event.target.value)}
                placeholder={t('tournamentNamePlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('sport')}>
              <Select value={sport} onValueChange={(value: 'footvolley') => setSport(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="footvolley">{sportName('footvolley')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('tournamentType')}>
              <Select value={tournamentType} onValueChange={(value: TournamentType) => setTournamentType(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="open-pairs">{t('openPairs')}</SelectItem>
                  <SelectItem value="mixed-pairs">{t('mixedPairs')}</SelectItem>
                  <SelectItem value="king-of-the-court">{t('kingOfTheCourt')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('eventDate')}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
                  >
                    <Calendar className="h-4 w-4 text-neon-cyan" />
                    <span>{formattedEventDate}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                  <CalendarPicker
                    mode="range"
                    selected={eventDateRange}
                    onSelect={setEventDateRange}
                    disabled={{ before: today }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label={t('registrationDeadline')}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
                  >
                    <Calendar className="h-4 w-4 text-neon-cyan" />
                    <span>{formattedRegistrationDeadline}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                  <CalendarPicker
                    mode="single"
                    selected={registrationDeadline}
                    onSelect={(nextDate) => {
                      if (!nextDate) return;
                      setRegistrationDeadline(nextDate);
                    }}
                    disabled={{ before: today }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label={t('sportComplex')}>
              <Select value={complexId} onValueChange={setComplexId}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {ownerComplexes.map((complex) => (
                    <SelectItem key={complex.id} value={complex.id}>
                      {complex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('entryFee')}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neon-cyan">R$</span>
                <Input
                  value={entryFee}
                  onChange={(event) => setEntryFee(event.target.value)}
                  className="border-border bg-background/60 pl-10"
                />
              </div>
            </Field>

            <Field label={t('transmissionUrl')}>
              <Input
                value={transmissionUrl}
                onChange={(event) => setTransmissionUrl(event.target.value)}
                placeholder={t('transmissionUrlPlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('bracketSize')}>
              <Select value={bracketSize} onValueChange={(value: BracketSize) => setBracketSize(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-5">
            <BackgroundUploadField
              label={t('championshipBackground')}
              buttonLabel={t('selectImage')}
              image={selectedBackgroundImage}
              offsetY={selectedBackgroundOffsetY}
              onOffsetYChange={setSelectedBackgroundOffsetY}
              onImageChange={async (file) => {
                setSelectedBackgroundImage(await readFileAsDataUrl(file));
                setSelectedBackgroundOffsetY(0);
              }}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('categoryStartSchedule')}</span>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary-glow transition-smooth hover:border-primary/60 hover:bg-primary/20"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {t('addCategoryEntry')}
              </button>
            </div>

            {categoryEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                {t('addCategoryEntry')}
              </div>
            ) : (
              <div className="space-y-3">
                {categoryEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-border bg-background/40 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label={t('bracketFormat')}>
                        <Select
                          value={entry.format}
                          onValueChange={(value) => updateEntry(entry.id, 'format', value)}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            <SelectItem value="dupla-fechada">{t('duplaFechada')}</SelectItem>
                            <SelectItem value="cumbuca">{t('cumbucaFormat')}</SelectItem>
                            <SelectItem value="rei-da-praia">{t('reiDaPraia')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label={t('category')}>
                        <Select
                          value={entry.category}
                          onValueChange={(value) => updateEntry(entry.id, 'category', value)}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {CATEGORY_ORDER.map((cat) => (
                              <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label={t('audience')}>
                        <Select
                          value={entry.audience}
                          onValueChange={(value) => updateEntry(entry.id, 'audience', value)}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {AUDIENCE_OPTIONS.map((aud) => (
                              <SelectItem key={aud} value={aud}>{t(aud)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <Field label={t('startDay')}>
                        <Select
                          value={entry.date}
                          onValueChange={(value) => updateEntry(entry.id, 'date', value)}
                          disabled={eventDateOptions.length === 0}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue placeholder={t('selectDate')} />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {eventDateOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {fromDateValue(option).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label={t('startTime')}>
                        <Select
                          value={entry.time}
                          onValueChange={(value) => updateEntry(entry.id, 'time', value)}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {START_TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        title={t('remove')}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-smooth hover:border-live/40 hover:bg-live/10 hover:text-live"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('uniformIncluded')}</span>
            <div className="flex items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
              <div className="pr-4 pt-0.5">
                <div className="font-semibold text-foreground">{t('uniformIncluded')}</div>
                <div className="mt-1 text-xs text-muted-foreground">{uniformIncluded ? t('yes') : t('no')}</div>
              </div>
              <Switch checked={uniformIncluded} onCheckedChange={setUniformIncluded} />
            </div>
          </div>

          <div className="mt-5">
            <Field label={t('notes')}>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('notesPlaceholder')}
                className="min-h-[140px] border-border bg-background/60"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110"
            >
              <Trophy className="h-4 w-4" />
              {t('publishTournament')}
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
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">
                {sportName('footvolley')}
              </div>
              <h3 className="font-display text-2xl font-black leading-tight">{tournamentName}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <PreviewRow icon={<Trophy className="h-4 w-4 text-neon-cyan" />} label={t('tournamentType')} value={tournamentTypeLabel} />
                <PreviewRow icon={<Calendar className="h-4 w-4 text-neon-cyan" />} label={t('eventDate')} value={formattedEventDate} />
                <PreviewRow icon={<Calendar className="h-4 w-4 text-neon-cyan" />} label={t('registrationDeadline')} value={formattedRegistrationDeadline} />
                <PreviewRow icon={<Building2 className="h-4 w-4 text-neon-cyan" />} label={t('selectedVenue')} value={selectedComplex?.name ?? '-'} />
                <PreviewRow icon={<CircleDollarSign className="h-4 w-4 text-neon-cyan" />} label={t('entryFee')} value={`R$ ${entryFee}`} />
                <PreviewRow icon={<Sparkles className="h-4 w-4 text-neon-cyan" />} label={t('transmissionUrl')} value={transmissionUrl || '-'} />
                <PreviewRow icon={<Sparkles className="h-4 w-4 text-neon-cyan" />} label={t('uniformIncluded')} value={uniformIncluded ? t('yes') : t('no')} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {categoryEntries.map((entry) => (
                  <Tag key={entry.id}>{t(entry.format === 'dupla-fechada' ? 'duplaFechada' : entry.format === 'cumbuca' ? 'cumbucaFormat' : 'reiDaPraia')} · {t(entry.category)} · {t(entry.audience)}</Tag>
                ))}
                <Tag>{bracketSize} {t('teams')}</Tag>
                <Tag>{tournamentTypeLabel}</Tag>
              </div>
              {categoryEntries.length > 0 && (
                <div className="mt-5 space-y-2 border-t border-border/70 pt-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{t('categoryStartSchedule')}</div>
                  <div className="space-y-2">
                    {categoryEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/35 px-3 py-2 text-xs">
                        <span className="font-semibold text-foreground">{t(entry.category)} · {t(entry.audience)}</span>
                        <span className="text-muted-foreground">
                          {entry.date && entry.time
                            ? `${fromDateValue(entry.date).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })} · ${entry.time}`
                            : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('ownerComplexes')}</h2>
            </div>
            <div className="space-y-3">
              {ownerComplexes.map((complex) => (
                <div key={complex.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="font-semibold text-foreground">{complex.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{complex.city}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {complex.sports.map((sportId) => (
                      <Tag key={sportId}>
                        {sportName(sportId)}
                      </Tag>
                    ))}
                  </div>
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

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow">
    {children}
  </span>
);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default TournamentSettings;
