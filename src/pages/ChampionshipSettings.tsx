import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Loader2, PlusCircle, Save, ShieldCheck, Trash2, Trophy } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BackgroundUploadField } from '@/components/BackgroundUploadField';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { categoriesApi, championshipApi, sportComplexApi } from '@/lib/api';
import type { SportId } from '@/types';

type CategoryEntry = {
  id: string;
  format_slug: string;
  category_slug: string;
  audience_slug: string;
  entry_fee: string;
  players_per_team: string;
  start_date: string;
  start_time: string;
};

const AUDIENCE_SLUGS = ['mixed', 'male', 'female'] as const;
const FORMAT_SLUGS = ['dupla-fechada', 'cumbuca', 'rei-da-praia'] as const;
const START_TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
const STATUS_OPTIONS = ['draft', 'open', 'running', 'finished'] as const;
const BRACKET_OPTIONS = [8, 16, 32, 64];

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromDateStr = (s: string) => new Date(`${s}T12:00:00`);

const buildDateOptions = (range: DateRange | undefined): string[] => {
  if (!range?.from) return [];
  const end = range.to ?? range.from;
  const dates: string[] = [];
  const cur = new Date(range.from);
  cur.setHours(12, 0, 0, 0);
  const endD = new Date(end);
  endD.setHours(12, 0, 0, 0);
  while (cur <= endD) {
    dates.push(toDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

let _nextId = 100;
const genId = () => String(_nextId++);

const mapSportSlug = (slug: string | null | undefined): SportId | null => {
  if (slug === 'footvolley') return 'footvolley';
  if (slug === 'beach-tennis') return 'beach-tennis';
  if (slug === 'volleyball') return 'volleyball';
  return null;
};

const ChampionshipSettings = () => {
  const { championshipId } = useParams<{ championshipId: string }>();
  const isEditing = !!championshipId;
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { token, currentUser, isGestorMode } = useSession();
  const queryClient = useQueryClient();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  // ── Remote data ────────────────────────────────────────────────────────────
  const { data: existing, isLoading: isLoadingChamp } = useQuery({
    queryKey: ['championship', championshipId],
    queryFn: () => championshipApi.get(token!, championshipId!),
    enabled: !!token && isEditing,
  });

  const { data: myComplexes = [] } = useQuery({
    queryKey: ['complexes-mine'],
    queryFn: () => sportComplexApi.listMine(token!),
    enabled: !!token,
  });

  const { data: sports = [] } = useQuery({
    queryKey: ['championship-sports'],
    queryFn: () => championshipApi.listSports(token!),
    enabled: !!token,
  });

  const { data: categoriesCatalog = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(token!),
    enabled: !!token,
  });

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [sportId, setSportId] = useState<string>('');
  const [formatId, setFormatId] = useState<string>('');
  const [complexId, setComplexId] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');
  const [bracketSize, setBracketSize] = useState<string>('16');
  const [transmissionUrl, setTransmissionUrl] = useState('');
  const [addressUrl, setAddressUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uniformIncluded, setUniformIncluded] = useState(false);
  const [eventRange, setEventRange] = useState<DateRange | undefined>(undefined);
  const [regDeadline, setRegDeadline] = useState<Date | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [image, setImage] = useState('');
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Populate form from existing data (edit mode)
  useEffect(() => {
    if (!isEditing || !existing || initialized) return;
    setName(existing.name);
    setSportId(existing.sport_id != null ? String(existing.sport_id) : '');
    setFormatId(existing.format_id != null ? String(existing.format_id) : '');
    setComplexId(existing.complex_id != null ? String(existing.complex_id) : '');
    setStatus(existing.status);
    setBracketSize(existing.bracket_size != null ? String(existing.bracket_size) : '16');
    setTransmissionUrl(existing.transmission_url ?? '');
    setAddressUrl(existing.address_url ?? '');
    setNotes(existing.notes ?? '');
    setUniformIncluded(existing.uniform_included);
    setEventRange(
      existing.start_date
        ? { from: fromDateStr(existing.start_date), to: existing.end_date ? fromDateStr(existing.end_date) : undefined }
        : undefined,
    );
    setRegDeadline(existing.registration_deadline ? fromDateStr(existing.registration_deadline) : undefined);
    setCategories(
      existing.categories.map((cat) => ({
        id: String(cat.id ?? genId()),
        format_slug: cat.format_slug,
        category_slug: cat.category_slug,
        audience_slug: cat.audience_slug,
        entry_fee: cat.entry_fee != null ? String(cat.entry_fee) : '',
        players_per_team: String(cat.players_per_team ?? 2),
        start_date: cat.start_date ?? '',
        start_time: cat.start_time ?? '',
      })),
    );
    setImage(existing.image_url ?? '');
    setImageOffsetX(existing.image_offset_x ?? 0);
    setImageOffsetY(existing.image_offset_y);
    setImageZoom(existing.image_zoom ?? 1);
    setInitialized(true);
  }, [existing, isEditing, initialized]);

  useEffect(() => {
    if (!sports.length) return;
    if (sportId) return;
    setSportId(String(sports[0].id));
  }, [sports, sportId]);

  useEffect(() => {
    if (!categoriesCatalog.length) return;
    setCategories((prev) =>
      prev.map((category) => {
        if (categoriesCatalog.some((item) => item.slug === category.category_slug)) {
          return category;
        }
        return {
          ...category,
          category_slug: categoriesCatalog[0].slug,
        };
      }),
    );
  }, [categoriesCatalog]);

  const eventDateOptions = useMemo(() => buildDateOptions(eventRange), [eventRange]);

  // Keep category dates in range when event range changes
  useEffect(() => {
    const first = eventDateOptions[0] ?? '';
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        start_date: c.start_date && eventDateOptions.includes(c.start_date) ? c.start_date : first,
      })),
    );
  }, [eventDateOptions]);

  const fmtRange = useMemo(() => {
    if (!eventRange?.from) return '-';
    const s = eventRange.from.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!eventRange.to) return s;
    return `${s} – ${eventRange.to.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }, [eventRange, locale]);

  const fmtDeadline = regDeadline?.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) ?? '-';

  // ── Category helpers ───────────────────────────────────────────────────────
  const addCategory = () =>
    setCategories((prev) => [...prev, {
      id: genId(), format_slug: 'dupla-fechada', category_slug: categoriesCatalog[0]?.slug ?? 'beginner',
      audience_slug: 'mixed', entry_fee: '', players_per_team: '2', start_date: eventDateOptions[0] ?? '', start_time: '09:00',
    }]);

  const removeCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

  const updateCategory = (id: string, field: keyof Omit<CategoryEntry, 'id'>, value: string) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (nextStatus = status) => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sport_id: sportId ? Number(sportId) : null,
        format_id: formatId ? Number(formatId) : null,
        complex_id: complexId ? Number(complexId) : null,
        status: nextStatus,
        bracket_size: bracketSize ? Number(bracketSize) : null,
        transmission_url: transmissionUrl.trim() || null,
        address_url: addressUrl.trim() || null,
        notes: notes.trim() || null,
        uniform_included: uniformIncluded,
        image_offset_x: Math.round(imageOffsetX),
        image_offset_y: imageOffsetY,
        image_zoom: imageZoom,
        start_date: eventRange?.from ? toDateStr(eventRange.from) : null,
        end_date: eventRange?.to ? toDateStr(eventRange.to) : (eventRange?.from ? toDateStr(eventRange.from) : null),
        registration_deadline: regDeadline ? toDateStr(regDeadline) : null,
        categories: categories.map((c) => ({
          format_slug: c.format_slug,
          category_slug: c.category_slug,
          audience_slug: c.audience_slug,
          entry_fee: c.entry_fee ? Number(c.entry_fee) : null,
          players_per_team: c.players_per_team ? Number(c.players_per_team) : 2,
          start_date: c.start_date || null,
          start_time: c.start_time || null,
        })),
      };

      const saved = isEditing
        ? await championshipApi.update(token!, championshipId!, payload)
        : await championshipApi.create(token!, payload);

      if (image.startsWith('data:')) {
        const { url } = await championshipApi.uploadImage(token!, saved.id, image);
        setImage(url);
      }

      await queryClient.invalidateQueries({ queryKey: ['championships'] });
      if (isEditing) await queryClient.invalidateQueries({ queryKey: ['championship', championshipId] });

      notify.success(isEditing ? t('saveChanges') : t('tournamentPublished'), saved.name);
      if (!isEditing) navigate(`/management/championships/${saved.id}/edit`);
    } catch {
      notify.error('Erro ao salvar campeonato');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    try {
      await championshipApi.delete(token!, championshipId!);
      await queryClient.invalidateQueries({ queryKey: ['championships'] });
      notify.success(t('championshipDeleted'));
      navigate('/management/championships');
    } catch {
      notify.error('Erro ao excluir campeonato');
    }
  };

  // ── Access guard ───────────────────────────────────────────────────────────
  if (!isGestorMode && !currentUser.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black"><span className="neon-text">{t('championships')}</span></h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  if (isEditing && isLoadingChamp) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const isValid = name.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/management/championships')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">
            {isEditing ? t('editChampionship') : t('tournamentBuilder')}
          </p>
          {isEditing && existing && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{existing.name}</p>
          )}
        </div>
      </header>

      {/* Delete confirm */}
      {showDelete && (
        <div className="rounded-2xl border border-live/30 bg-live/10 p-5">
          <p className="font-semibold text-live">{t('deleteConfirmTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('deleteConfirmDescription')}</p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 rounded-lg bg-live px-4 py-2 text-sm font-bold text-white transition-smooth hover:brightness-110">
              <Trash2 className="h-4 w-4" />{t('confirmDelete')}
            </button>
            <button type="button" onClick={() => setShowDelete(false)} className="inline-flex items-center rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-semibold transition-smooth hover:bg-secondary">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t('tournamentName')} className="sm:col-span-2 lg:col-span-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('tournamentNamePlaceholder')} className="border-border bg-background/60" />
          </Field>

          <Field label="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="open">Inscrições abertas</SelectItem>
                <SelectItem value="running">Em andamento</SelectItem>
                <SelectItem value="finished">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('sport')}>
            <Select value={sportId} onValueChange={setSportId}>
              <SelectTrigger className="border-border bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={String(sport.id)}>
                    {mapSportSlug(sport.slug) ? sportName(mapSportSlug(sport.slug)!) : sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('sportComplex')}>
            <Select value={complexId} onValueChange={setComplexId}>
              <SelectTrigger className="border-border bg-background/60"><SelectValue placeholder="Selecionar complexo" /></SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {myComplexes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('bracketSize')}>
            <Select value={bracketSize} onValueChange={setBracketSize}>
              <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {BRACKET_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('eventDate')}>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40">
                  <Calendar className="h-4 w-4 text-neon-cyan" /><span>{fmtRange}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                <CalendarPicker mode="range" selected={eventRange} onSelect={setEventRange} disabled={{ before: today }} numberOfMonths={2} initialFocus />
              </PopoverContent>
            </Popover>
          </Field>

          <Field label={t('registrationDeadline')}>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40">
                  <Calendar className="h-4 w-4 text-neon-cyan" /><span>{fmtDeadline}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                <CalendarPicker mode="single" selected={regDeadline} onSelect={(d) => d && setRegDeadline(d)} disabled={{ before: today }} initialFocus />
              </PopoverContent>
            </Popover>
          </Field>

          <Field label={t('transmissionUrl')}>
            <Input value={transmissionUrl} onChange={(e) => setTransmissionUrl(e.target.value)} placeholder={t('transmissionUrlPlaceholder')} className="border-border bg-background/60" />
          </Field>

          <Field label={t('addressUrl')}>
            <Input value={addressUrl} onChange={(e) => setAddressUrl(e.target.value)} placeholder={t('addressUrlPlaceholder')} className="border-border bg-background/60" />
          </Field>
        </div>

        {/* Image */}
        <div className="mt-6">
          <div className="mx-auto max-w-[280px] md:mx-0">
            <BackgroundUploadField
              label={t('championshipBackground')}
              buttonLabel={t('selectImage')}
              image={image}
              offsetX={imageOffsetX}
              offsetY={imageOffsetY}
              zoom={imageZoom}
              onOffsetXChange={setImageOffsetX}
              onOffsetYChange={setImageOffsetY}
              onZoomChange={setImageZoom}
              onImageChange={async (file) => {
                setImage(await readFileAsDataUrl(file));
                setImageOffsetX(0);
                setImageOffsetY(0);
                setImageZoom(1);
              }}
            />
          </div>
        </div>

        {/* Uniform toggle */}
        <div className="mt-6">
          <div className="flex items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
            <div className="pr-4 pt-0.5">
              <div className="font-semibold text-foreground">{t('uniformIncluded')}</div>
              <div className="mt-1 text-xs text-muted-foreground">{uniformIncluded ? t('yes') : t('no')}</div>
            </div>
            <Switch checked={uniformIncluded} onCheckedChange={setUniformIncluded} />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('categoryStartSchedule')}</span>
            <button type="button" onClick={addCategory} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary-glow transition-smooth hover:border-primary/60 hover:bg-primary/20">
              <PlusCircle className="h-3.5 w-3.5" />{t('addCategoryEntry')}
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">{t('addCategoryEntry')}</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-2xl border border-border bg-background/40 p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Field label={t('bracketFormat')}>
                      <Select value={cat.format_slug} onValueChange={(v) => updateCategory(cat.id, 'format_slug', v)}>
                        <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          <SelectItem value="dupla-fechada">{t('duplaFechada')}</SelectItem>
                          <SelectItem value="cumbuca">{t('cumbucaFormat')}</SelectItem>
                          <SelectItem value="rei-da-praia">{t('reiDaPraia')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={t('category')}>
                      <Select value={cat.category_slug} onValueChange={(v) => updateCategory(cat.id, 'category_slug', v)}>
                        <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {categoriesCatalog.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {t(category.slug)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={t('audience')}>
                      <Select value={cat.audience_slug} onValueChange={(v) => updateCategory(cat.id, 'audience_slug', v)}>
                        <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {AUDIENCE_SLUGS.map((s) => <SelectItem key={s} value={s}>{t(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={t('entryFee')}>
                      <NumberStepper
                        value={cat.entry_fee}
                        onChange={(v) => updateCategory(cat.id, 'entry_fee', v)}
                        step={10}
                        min={0}
                        prefix="R$"
                      />
                    </Field>
                    <Field label={t('players')}>
                      <NumberStepper
                        value={cat.players_per_team}
                        onChange={(v) => updateCategory(cat.id, 'players_per_team', v)}
                        step={1}
                        min={1}
                        max={8}
                      />
                    </Field>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <Field label={t('startDay')}>
                      <Select value={cat.start_date} onValueChange={(v) => updateCategory(cat.id, 'start_date', v)} disabled={eventDateOptions.length === 0}>
                        <SelectTrigger className="border-border bg-background/60"><SelectValue placeholder={t('selectDate')} /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {eventDateOptions.map((d) => (
                            <SelectItem key={d} value={d}>
                              {fromDateStr(d).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={t('startTime')}>
                      <Select value={cat.start_time} onValueChange={(v) => updateCategory(cat.id, 'start_time', v)}>
                        <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {START_TIMES.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <button type="button" onClick={() => removeCategory(cat.id)} title={t('remove')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-smooth hover:border-live/40 hover:bg-live/10 hover:text-live">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-6">
          <Field label={t('notes')}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notesPlaceholder')} className="min-h-[120px] border-border bg-background/60" />
          </Field>
        </div>

        {/* Bottom save button */}
        <div className="mt-8 flex gap-3 border-t border-border/50 pt-6">
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              title={t('confirmDelete')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-live/30 bg-live/10 text-live transition-smooth hover:border-live/60 hover:bg-live/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(isEditing ? status : 'open')}
            disabled={!isValid || isSaving}
            className={`inline-flex items-center justify-center rounded-xl border transition-smooth disabled:cursor-not-allowed disabled:opacity-60 ${
              isEditing
                ? 'h-11 w-11 border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] hover:bg-primary/16'
                : 'gap-2 border-border bg-background/55 px-4 py-3 text-sm font-semibold text-foreground hover:border-neon-cyan/35 hover:text-neon-cyan'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              <Save className="h-4 w-4" />
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                <span>{t('publishTournament')}</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

const NumberStepper = ({
  value,
  onChange,
  step = 1,
  min,
  max,
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
}) => {
  const num = Number(value) || 0;
  const decrement = () => {
    const next = num - step;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  };
  const increment = () => {
    const next = num + step;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  };
  return (
    <div className="flex h-10 overflow-hidden rounded-lg border border-border bg-background/60">
      {prefix && (
        <span className="flex items-center border-r border-border px-2.5 text-xs font-bold text-neon-cyan">
          {prefix}
        </span>
      )}
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
        className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <div className="flex w-9 shrink-0 flex-col border-l border-border">
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && num >= max}
          className="flex h-1/2 items-center justify-center text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={decrement}
          disabled={min !== undefined && num <= min}
          className="flex h-1/2 items-center justify-center border-t border-border text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default ChampionshipSettings;
