import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, PlusCircle, Save, ShieldCheck, Trash2, Trophy } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BackgroundUploadField } from '@/components/BackgroundUploadField';
import { DateTimePicker } from '@/components/DateTimePicker';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { localToUtcIso, utcIsoToLocal } from '@/lib/datetime';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoriesApi, championshipApi, championshipFormatsApi, paymentMethodsApi, sportComplexApi } from '@/lib/api';
import type { SportId } from '@/types';

type MatchSettingEntry = {
  stage_type: string;
  max_sets: 1 | 3;
};

type CategoryEntry = {
  id: string;
  backend_id?: number;
  format_id: string;
  category_slug: string;
  audience_slug: string;
  entry_fee: string;
  max_subscriptions: string;
  auto_generate_matches: boolean;
  requires_approval: boolean;
  double_elimination_enabled: boolean;
  start_date: string;
  start_time: string;
  match_settings: MatchSettingEntry[];
};

const AUDIENCE_SLUGS = ['mixed', 'male', 'female'] as const;
const START_TIMES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];
const STATUS_OPTIONS = ['draft', 'open', 'subscription_ended', 'live', 'ended'] as const;
const HOST_VENUE_TYPES = ['complex', 'beach', 'arena', 'club', 'other'] as const;
const DEFAULT_STAGE_TYPES = ['other'] as const;
const STAGE_LABELS: Record<string, string> = {
  other: 'Outros Jogos',
  default: 'Outros Jogos',
  group: 'Fase de grupos',
  round_of_256: 'Round of 256',
  round_of_128: 'Round of 128',
  round_of_64: 'Round of 64',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarterfinal: 'Quartas de final',
  semifinal: 'Semifinal',
  winners_bracket: 'Chave vencedores',
  losers_bracket: 'Chave perdedores',
  grand_final: 'Grande final',
  finais_semi: 'Semi final DE',
  final: 'Final',
  third_place: '3º lugar',
};

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'São Paulo / Brasília (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus / Campo Grande (UTC-4)' },
  { value: 'America/Belem', label: 'Belém / Fortaleza / Recife (UTC-3)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (UTC-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco / Acre (UTC-5)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (UTC+0)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
];

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromDateStr = (s: string) => new Date(`${s}T12:00:00`);

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

const getStageTypesForFormat = (formatId: string, formatsCatalog: Array<{ id: number; config_json: Record<string, unknown> | null }>) => {
  const selectedFormat = formatsCatalog.find((format) => String(format.id) === formatId);
  const rawStageTypes = selectedFormat?.config_json?.stage_types;
  if (!Array.isArray(rawStageTypes) || rawStageTypes.length === 0) {
    return [...DEFAULT_STAGE_TYPES];
  }
  return rawStageTypes
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.toLowerCase());
};

const normalizeMatchSettingsForStages = (
  existing: MatchSettingEntry[],
  stageTypes: string[],
): MatchSettingEntry[] => {
  const existingByStage = new Map(
    existing.map((setting) => [
      setting.stage_type === 'default' ? 'other' : setting.stage_type,
      {
        ...setting,
        stage_type: setting.stage_type === 'default' ? 'other' : setting.stage_type,
      },
    ]),
  );
  return stageTypes.map((stageType) => {
    const current = existingByStage.get(stageType);
    return {
      stage_type: stageType,
      max_sets: current?.max_sets === 3 ? 3 : 1,
    };
  });
};

const ChampionshipSettings = () => {
  const { championshipId } = useParams<{ championshipId: string }>();
  const isEditing = !!championshipId;
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { token } = useSession();
  const queryClient = useQueryClient();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  // ── Remote data ────────────────────────────────────────────────────────────
  const { data: existing, isLoading: isLoadingChamp } = useQuery({
    queryKey: ['championship', championshipId],
    queryFn: () => championshipApi.get(token!, championshipId!),
    enabled: !!token && isEditing,
  });

  const { data: accessibleComplexesResponse } = useQuery({
    queryKey: ['complexes-accessible-for-championship'],
    queryFn: () => sportComplexApi.list(token!, 1, 100),
    enabled: !!token,
  });
  const accessibleComplexes = accessibleComplexesResponse?.items ?? [];

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

  const { data: paymentMethodOptions = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodsApi.list(token!),
    enabled: !!token,
  });

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [sportId, setSportId] = useState<string>('');
  const [venueType, setVenueType] = useState<(typeof HOST_VENUE_TYPES)[number]>('complex');
  const [complexId, setComplexId] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');
  const [isPublic, setIsPublic] = useState(true);
  const [transmissionUrl, setTransmissionUrl] = useState('');
  const [addressUrl, setAddressUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uniformIncluded, setUniformIncluded] = useState(false);
  const [autoGenerateStatus, setAutoGenerateStatus] = useState(true);
  const [timezone, setTimezone] = useState<string>('America/Sao_Paulo');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string>('18:00');
  const [deadlineDate, setDeadlineDate] = useState<string | undefined>(undefined);
  const [deadlineTime, setDeadlineTime] = useState<string>('23:00');
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [image, setImage] = useState('');
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [preferredPaymentMethods, setPreferredPaymentMethods] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: formatsCatalog = [] } = useQuery({
    queryKey: ['championship-formats', sportId],
    queryFn: () => championshipFormatsApi.list(token!, sportId ? Number(sportId) : undefined),
    enabled: !!token,
  });

  // Populate form from existing data (edit mode)
  useEffect(() => {
    if (!isEditing || !existing || initialized) return;
    const config = existing.config_json ?? {};
    const savedVenueType = typeof config.host_venue_type === 'string'
      ? config.host_venue_type
      : (existing.complex_id != null ? 'complex' : 'other');
    setName(existing.name);
    setSportId(existing.sport_id != null ? String(existing.sport_id) : '');
    setVenueType(HOST_VENUE_TYPES.includes(savedVenueType as (typeof HOST_VENUE_TYPES)[number]) ? savedVenueType as (typeof HOST_VENUE_TYPES)[number] : 'other');
    setComplexId(existing.complex_id != null ? String(existing.complex_id) : '');
    setStatus(existing.status);
    setIsPublic(existing.is_public ?? true);
    setTransmissionUrl(existing.transmission_url ?? '');
    setAddressUrl(existing.address_url ?? '');
    setNotes(existing.notes ?? '');
    setUniformIncluded(existing.uniform_included);
    setAutoGenerateStatus(existing.auto_generate_status ?? true);
    const tz = existing.timezone ?? 'America/Sao_Paulo';
    setTimezone(tz);
    if (existing.start_at) {
      const local = utcIsoToLocal(existing.start_at, tz);
      setStartDate(local.date);
      setStartTime(local.time);
    }
    if (existing.end_at) {
      const local = utcIsoToLocal(existing.end_at, tz);
      setEndDate(local.date);
      setEndTime(local.time);
    }
    if (existing.registration_deadline_at) {
      const local = utcIsoToLocal(existing.registration_deadline_at, tz);
      setDeadlineDate(local.date);
      setDeadlineTime(local.time);
    }
    setCategories(
      existing.categories.map((cat) => ({
        id: String(cat.id ?? genId()),
        backend_id: cat.id,
        format_id: cat.format_id != null ? String(cat.format_id) : '',
        category_slug: cat.category_slug,
        audience_slug: cat.audience_slug,
        entry_fee: cat.entry_fee != null ? String(cat.entry_fee) : '',
        max_subscriptions: cat.max_subscriptions != null ? String(cat.max_subscriptions) : '',
        auto_generate_matches: cat.auto_generate_matches ?? true,
        requires_approval: cat.requires_approval ?? false,
        double_elimination_enabled: cat.double_elimination_enabled ?? true,
        start_date: cat.start_date ?? '',
        start_time: cat.start_time ?? '',
        match_settings: (cat.match_settings ?? []).map((setting) => ({
          stage_type: setting.stage_type,
          max_sets: setting.max_sets === 3 ? 3 : 1,
        })),
      })),
    );
    setImage(existing.image_url ?? '');
    setImageOffsetX(existing.image_offset_x ?? 0);
    setImageOffsetY(existing.image_offset_y);
    setImageZoom(existing.image_zoom ?? 1);
    setPreferredPaymentMethods(existing.preferred_payment_methods ?? []);
    setInitialized(true);
  }, [existing, isEditing, initialized]);

  useEffect(() => {
    if (isEditing) return;
    if (!sports.length) return;
    if (sportId) return;
    setSportId(String(sports[0].id));
  }, [isEditing, sports, sportId]);

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

  useEffect(() => {
    if (!formatsCatalog.length) return;
    setCategories((prev) =>
      prev.map((category) => {
        const nextMatchSettings = normalizeMatchSettingsForStages(
          category.match_settings,
          getStageTypesForFormat(category.format_id, formatsCatalog),
        );
        const currentSerialized = JSON.stringify(category.match_settings);
        const nextSerialized = JSON.stringify(nextMatchSettings);
        if (currentSerialized === nextSerialized) {
          return category;
        }
        return {
          ...category,
          match_settings: nextMatchSettings,
        };
      }),
    );
  }, [formatsCatalog]);

  const eventDateOptions = useMemo(() => {
    if (!startDate) return [];
    const end = endDate ?? startDate;
    const dates: string[] = [];
    const cur = new Date(`${startDate}T12:00:00`);
    const endD = new Date(`${end}T12:00:00`);
    while (cur <= endD) {
      dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

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

  // ── Category helpers ───────────────────────────────────────────────────────
  const addCategory = () =>
    setCategories((prev) => {
      const nextFormatId = formatsCatalog[0]?.id != null ? String(formatsCatalog[0].id) : '';
      return [...prev, {
        id: genId(),
        backend_id: undefined,
        format_id: nextFormatId,
        category_slug: categoriesCatalog[0]?.slug ?? 'beginner',
        audience_slug: 'mixed',
        entry_fee: '15',
        max_subscriptions: '',
        auto_generate_matches: true,
        requires_approval: false,
        double_elimination_enabled: true,
        start_date: eventDateOptions[0] ?? '',
        start_time: '09:00',
        match_settings: normalizeMatchSettingsForStages([], getStageTypesForFormat(nextFormatId, formatsCatalog)),
      }];
    });

  const removeCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

  const updateCategory = (
    id: string,
    field: keyof Omit<CategoryEntry, 'id' | 'backend_id'>,
    value: string | boolean | MatchSettingEntry[],
  ) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const updateCategoryMatchSetting = (
    categoryId: string,
    stageType: string,
    maxSets: 1 | 3,
  ) =>
    setCategories((prev) => prev.map((category) => {
      if (category.id !== categoryId) return category;
      return {
        ...category,
        match_settings: category.match_settings.map((setting) => (
          setting.stage_type === stageType
            ? { ...setting, max_sets: maxSets }
            : setting
        )),
      };
    }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (nextStatus = status) => {
    if (!name.trim()) return;
    const hasInvalidEntryFee = categories.some((category) => category.entry_fee && Number(category.entry_fee) < 15);
    if (hasInvalidEntryFee) {
      notify.error('Valor da inscrição deve ser no mínimo R$ 15,00');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sport_id: sportId ? Number(sportId) : null,
        complex_id: venueType === 'complex' && complexId ? Number(complexId) : null,
        status: nextStatus,
        is_public: isPublic,
        transmission_url: transmissionUrl.trim() || null,
        address_url: addressUrl.trim() || null,
        notes: notes.trim() || null,
        uniform_included: uniformIncluded,
        auto_generate_status: autoGenerateStatus,
        image_offset_x: Math.round(imageOffsetX),
        image_offset_y: Math.round(imageOffsetY),
        image_zoom: imageZoom,
        preferred_payment_methods: preferredPaymentMethods,
        config_json: {
          ...(existing?.config_json ?? {}),
          host_venue_type: venueType,
        },
        timezone: timezone || null,
        start_at: startDate ? localToUtcIso(startDate, startTime, timezone) : null,
        end_at: endDate ? localToUtcIso(endDate, endTime, timezone) : null,
        registration_deadline_at: deadlineDate ? localToUtcIso(deadlineDate, deadlineTime, timezone) : null,
        categories: categories.map((c) => ({
          id: c.backend_id,
          format_id: c.format_id ? Number(c.format_id) : null,
          category_slug: c.category_slug,
          audience_slug: c.audience_slug,
          entry_fee: c.entry_fee ? Number(c.entry_fee) : null,
          max_subscriptions: c.max_subscriptions ? Number(c.max_subscriptions) : null,
          auto_generate_matches: c.auto_generate_matches,
          requires_approval: c.requires_approval,
          double_elimination_enabled: c.double_elimination_enabled,
          start_date: c.start_date || null,
          start_time: c.start_time || null,
          match_settings: c.match_settings.map((setting) => ({
            stage_type: setting.stage_type,
            max_sets: setting.max_sets,
            sets_to_win: setting.max_sets === 3 ? 2 : 1,
          })),
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

      notify.success(isEditing ? t('championshipUpdated') : t('tournamentPublished'), saved.name);
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

  if (isEditing && isLoadingChamp) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const isValid =
    name.trim().length > 0 &&
    status.length > 0 &&
    sportId.length > 0 &&
    !!startDate &&
    !!deadlineDate &&
    timezone.length > 0 &&
    (venueType !== 'complex' || complexId.length > 0) &&
    categories.length > 0;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
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
                <SelectItem value="subscription_ended">Inscrições encerradas</SelectItem>
                <SelectItem value="live">Ao vivo</SelectItem>
                <SelectItem value="ended">Finalizado</SelectItem>
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

          <Field label={t('championshipVenueType')}>
            <Select
              value={venueType}
              onValueChange={(value) => {
                const nextValue = value as (typeof HOST_VENUE_TYPES)[number];
                setVenueType(nextValue);
                if (nextValue !== 'complex') setComplexId('');
              }}
            >
              <SelectTrigger className="border-border bg-background/60"><SelectValue placeholder={t('championshipVenueTypePlaceholder')} /></SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="complex">{t('championshipVenueTypeComplex')}</SelectItem>
                <SelectItem value="beach">{t('championshipVenueTypeBeach')}</SelectItem>
                <SelectItem value="arena">{t('championshipVenueTypeArena')}</SelectItem>
                <SelectItem value="club">{t('championshipVenueTypeClub')}</SelectItem>
                <SelectItem value="other">{t('championshipVenueTypeOther')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {venueType === 'complex' ? (
            <Field label={t('sportComplex')}>
              <Select value={complexId} onValueChange={setComplexId}>
                <SelectTrigger className="border-border bg-background/60"><SelectValue placeholder={t('selectComplex')} /></SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {accessibleComplexes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">{t('championshipHostComplexHint')}</p>
            </Field>
          ) : null}

          {/* Event date range — spans 2 cols so start+end are visually grouped */}
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('eventDate')}</span>
            <div className="grid grid-cols-2 gap-3">
              <DateTimePicker
                date={startDate}
                time={startTime}
                onChange={(d, t) => { setStartDate(d); setStartTime(t); }}
                placeholder="Início"
                minDate={today}
              />
              <DateTimePicker
                date={endDate}
                time={endTime}
                onChange={(d, t) => { setEndDate(d); setEndTime(t); }}
                placeholder="Fim"
                minDate={today}
              />
            </div>
          </div>

          <Field label={t('registrationDeadline')}>
            <DateTimePicker
              date={deadlineDate}
              time={deadlineTime}
              onChange={(d, t) => { setDeadlineDate(d); setDeadlineTime(t); }}
              placeholder="-"
              minDate={today}
            />
          </Field>

          <Field label={t('timezone')} className="sm:col-span-2 lg:col-span-3">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="border-border bg-background/60"><SelectValue placeholder={t('selectTimezone')} /></SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="mx-auto max-w-[280px]">
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

        {/* Toggles */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
            <div className="pr-4 pt-0.5">
              <div className="font-semibold text-foreground">{t('championshipVisibility')}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isPublic ? t('championshipPublicDescription') : t('championshipPrivateDescription')}
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="flex items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
            <div className="pr-4 pt-0.5">
              <div className="font-semibold text-foreground">{t('uniformIncluded')}</div>
              <div className="mt-1 text-xs text-muted-foreground">{uniformIncluded ? t('yes') : t('no')}</div>
            </div>
            <Switch checked={uniformIncluded} onCheckedChange={setUniformIncluded} />
          </div>
          <div className="flex items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
            <div className="pr-4 pt-0.5">
              <div className="font-semibold text-foreground">{t('autoGenerateStatus')}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t('autoGenerateStatusDescription')}</div>
            </div>
            <Switch checked={autoGenerateStatus} onCheckedChange={setAutoGenerateStatus} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('paymentMethods')}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {paymentMethodOptions.map((method) => {
              const code = method.code;
              const isSelected = preferredPaymentMethods.includes(code);
              return (
                <label key={method.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      setPreferredPaymentMethods((current) => (
                        checked
                          ? Array.from(new Set([...current, code]))
                          : current.filter((value) => value !== code)
                      ));
                    }}
                  />
                  <span className="font-medium">{method.name}</span>
                </label>
              );
            })}
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
                  {(() => {
                    const selectedFormat = formatsCatalog.find((format) => String(format.id) === cat.format_id) ?? null;
                    const secondStageConfig = selectedFormat?.config_json?.second_stage;
                    const thirdStageConfig = selectedFormat?.config_json?.third_stage;
                    const doubleEliminationHints = [secondStageConfig, thirdStageConfig]
                      .flatMap((stageConfig) => {
                        const minimumPlayers = stageConfig?.double_elimination?.minimum_players;
                        if (typeof minimumPlayers !== 'number' || minimumPlayers <= 0) return [];
                        const requiredMultiple = stageConfig?.double_elimination?.required_multiple ?? 1;
                        const stageName = stageConfig?.name?.trim() || t('bracket');
                        return [{ stageName, minimumPlayers, requiredMultiple }];
                      });
                    const doubleEliminationAdvice = doubleEliminationHints.length > 0
                      ? language === 'pt-BR'
                        ? `Se ativada, a dupla eliminação só será gerada quando a fase tiver jogadores suficientes. ${doubleEliminationHints.map((hint) => `${hint.stageName}: mínimo ${hint.minimumPlayers} jogadores, múltiplo de ${hint.requiredMultiple} equipes`).join(' · ')}.`
                        : `If enabled, double elimination will only be generated when the stage has enough players. ${doubleEliminationHints.map((hint) => `${hint.stageName}: minimum ${hint.minimumPlayers} players, multiple of ${hint.requiredMultiple} teams`).join(' · ')}.`
                      : language === 'pt-BR'
                        ? 'Se ativada, a dupla eliminação ainda depende da configuração do formato e da quantidade de jogadores classificados.'
                        : 'If enabled, double elimination still depends on the format configuration and the number of qualified players.';
                    const configurableStageTypes = getStageTypesForFormat(cat.format_id, formatsCatalog);
                    const matchSettings = normalizeMatchSettingsForStages(cat.match_settings, configurableStageTypes);

                    return (
                      <>
                  {/* Row 1: format | category | audience — equal thirds */}
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                    <Field label={t('bracketFormat')}>
                      <Select
                        value={cat.format_id}
                        onValueChange={(v) => {
                          const nextStageTypes = getStageTypesForFormat(v, formatsCatalog);
                          setCategories((prev) => prev.map((category) => (
                            category.id === cat.id
                              ? {
                                  ...category,
                                  format_id: v,
                                  match_settings: normalizeMatchSettingsForStages(category.match_settings, nextStageTypes),
                                }
                              : category
                          )));
                        }}
                      >
                        <SelectTrigger className="border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {formatsCatalog.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                          ))}
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
                  </div>

                  {/* Row 2: entry fee | max subscriptions | start day | start time (narrow) */}
                  <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_76px]">
                    <Field label={t('entryFee')}>
                      <div className="flex h-10 overflow-hidden rounded-lg border border-border bg-background/60">
                        <span className="flex items-center border-r border-border px-2.5 text-xs font-bold text-neon-cyan">R$</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={cat.entry_fee}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9.]/g, '');
                            if (/^\d{0,3}(\.\d{0,2})?$/.test(raw)) {
                              if (raw === '' || parseFloat(raw) <= 999.99) {
                                updateCategory(cat.id, 'entry_fee', raw);
                              }
                            }
                          }}
                          placeholder="15.00"
                          className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">Mínimo R$ 15,00</p>
                    </Field>
                    <Field label={t('maxSubscriptions')}>
                      <NumberStepper
                        value={cat.max_subscriptions}
                        onChange={(v) => updateCategory(cat.id, 'max_subscriptions', v)}
                        step={1}
                        min={0}
                        max={999}
                      />
                    </Field>
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
                    <Field label="Hora">
                      <Select value={cat.start_time} onValueChange={(v) => updateCategory(cat.id, 'start_time', v)}>
                        <SelectTrigger className="w-full border-border bg-background/60"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                          {START_TIMES.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Row 3: auto-generate | approval (stack on mobile, side-by-side on sm+) | delete */}
                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                      <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-3 h-10">
                        <span className="text-xs font-semibold text-muted-foreground">{t('autoGenerateMatches')}</span>
                        <Switch checked={cat.auto_generate_matches} onCheckedChange={(v) => updateCategory(cat.id, 'auto_generate_matches', v)} />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-3 h-10">
                        <span className="text-xs font-semibold text-muted-foreground">{t('subscriptionApprovalRequired')}</span>
                        <Switch checked={cat.requires_approval} onCheckedChange={(v) => updateCategory(cat.id, 'requires_approval', v)} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeCategory(cat.id)} title={t('remove')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-smooth hover:border-live/40 hover:bg-live/10 hover:text-live">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 rounded-xl border border-border bg-background/30 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="pr-4">
                        <div className="text-xs font-semibold text-foreground">{t('doubleElimination')}</div>
                        <div className="mt-1 text-[11px] leading-5 text-muted-foreground">
                          {doubleEliminationAdvice}
                        </div>
                      </div>
                      <Switch
                        checked={cat.double_elimination_enabled}
                        onCheckedChange={(v) => updateCategory(cat.id, 'double_elimination_enabled', v)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-border bg-background/30 p-3">
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-foreground">Sets por fase</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Escolha 1 set (vence 1) ou 3 sets (vence 2) para cada fase configurada pelo formato.
                      </div>
                    </div>
                    <div className="space-y-2">
                      {matchSettings.map((setting) => (
                        <div key={`${cat.id}-${setting.stage_type}`} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{STAGE_LABELS[setting.stage_type] ?? setting.stage_type}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {setting.max_sets === 3 ? 'Melhor de 3, vence 2 sets' : 'Jogo único, vence 1 set'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateCategoryMatchSetting(cat.id, setting.stage_type, 1)}
                              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-smooth ${
                                setting.max_sets === 1
                                  ? 'border-primary/40 bg-primary/10 text-foreground'
                                  : 'border-border bg-background/50 text-muted-foreground'
                              }`}
                            >
                              1 set
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCategoryMatchSetting(cat.id, setting.stage_type, 3)}
                              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-smooth ${
                                setting.max_sets === 3
                                  ? 'border-primary/40 bg-primary/10 text-foreground'
                                  : 'border-border bg-background/50 text-muted-foreground'
                              }`}
                            >
                              3 sets
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                      </>
                    );
                  })()}
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
            className={`inline-flex items-center justify-center rounded-xl border transition-smooth ${(!isValid || isSaving) ? 'pointer-events-none cursor-not-allowed opacity-40' : ''} ${
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
        onChange={(e) => {
          const stripped = e.target.value.replace(/[^\d]/g, '');
          if (stripped === '') { onChange(''); return; }
          const n = Number(stripped);
          if (min !== undefined && n < min) return;
          if (max !== undefined && n > max) return;
          onChange(stripped);
        }}
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
