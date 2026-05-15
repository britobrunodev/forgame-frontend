import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { Camera, Phone, Save, Search, Trophy, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CountrySelect } from '@/components/CountrySelect';
import { DragSelectField } from '@/components/DragSelectField';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { COUNTRY_OPTIONS, formatPhoneNumber } from '@/data/countries';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { sportComplexApi, sportsApi, usersApi } from '@/lib/api';
import type { DocumentType, PlayerCharacteristic, PlayerLevel, SportId, UniformSize } from '@/types';

const levelColors: Record<string, string> = {
  beginner: 'border-muted-foreground/40 bg-muted-foreground/10 text-muted-foreground',
  'high-beginner': 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  intermediate: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan',
  'high-intermediate': 'border-primary/40 bg-primary/10 text-primary-glow',
  advanced: 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink',
  'high-advanced': 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
  professional: 'border-live/40 bg-live/10 text-live',
};

const CHARACTERISTICS_BY_SPORT: Partial<Record<SportId, PlayerCharacteristic[]>> = {
  footvolley: ['right', 'left'],
  'beach-tennis': ['right', 'left'],
  'beach-soccer': ['goalkeeper', 'midfielder'],
};

const _MIN_SAVING_FEEDBACK_MS = 800;

const ProfileSettings = () => {
  const { currentUser, updateCurrentUser, token } = useSession();
  const { language, t, sportName } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState(currentUser.name);
  const [nickname, setNickname] = useState(currentUser.nickname ?? '');
  const [email, setEmail] = useState(currentUser.email);
  const [nationality, setNationality] = useState(currentUser.country ?? 'BR');
  const [phoneCountry, setPhoneCountry] = useState(currentUser.phoneCountry ?? currentUser.country ?? 'BR');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber ?? '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl ?? '');
  const [selectedSports, setSelectedSports] = useState<SportId[]>(currentUser.preferences);
  const [sportCharacteristics, setSportCharacteristics] = useState<Partial<Record<SportId, PlayerCharacteristic[]>>>(
    currentUser.sportCharacteristics ?? {},
  );
  const [documentType, setDocumentType] = useState<DocumentType>(currentUser.documentType ?? 'cpf');
  const [documentNumber, setDocumentNumber] = useState(
    currentUser.documentType === 'cpf' ? formatCpf(currentUser.documentNumber ?? '') : (currentUser.documentNumber ?? ''),
  );
  const [uniformSize, setUniformSize] = useState<UniformSize | ''>(currentUser.uniformSize ?? '');
  const [gender, setGender] = useState<string>(currentUser.gender ?? '');
  const [preferredComplexIds, setPreferredComplexIds] = useState<number[]>(currentUser.preferredComplexes ?? []);
  const [preferredComplexSearch, setPreferredComplexSearch] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [cropSource, setCropSource] = useState('');
  const [cropImageSize, setCropImageSize] = useState({ width: 1, height: 1 });
  const [cropPreviewSize, setCropPreviewSize] = useState(320);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [lastSavedState, setLastSavedState] = useState<string>(() => serializeProfileState({
    name: currentUser.name,
    nickname: currentUser.nickname ?? '',
    email: currentUser.email,
    nationality: currentUser.country ?? 'BR',
    phoneCountry: currentUser.phoneCountry ?? currentUser.country ?? 'BR',
    phoneNumber: currentUser.phoneNumber ?? '',
    documentType: currentUser.documentType ?? 'cpf',
    documentNumber: currentUser.documentNumber ?? '',
    uniformSize: currentUser.uniformSize ?? '',
    gender: currentUser.gender ?? '',
    selectedSports: currentUser.preferences,
    sportCharacteristics: currentUser.sportCharacteristics ?? {},
    preferredComplexIds: currentUser.preferredComplexes ?? [],
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
  }));

  const { data: sportsData = [] } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportsApi.list(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  });

  const allSportSlugs = useMemo(() => sportsData.map((s) => s.slug as SportId), [sportsData]);
  const sportLabelFromSlug = useMemo(
    () => Object.fromEntries(sportsData.map((s) => [s.slug, s.name])),
    [sportsData],
  );

  const availableSports = useMemo(
    () => allSportSlugs.filter((slug) => !selectedSports.includes(slug)),
    [allSportSlugs, selectedSports],
  );

  const { data: preferredComplexesData } = useQuery({
    queryKey: ['complexes-public', 'all-for-profile'],
    queryFn: () => sportComplexApi.listAll(token!, 1, 100),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const activeComplexOptions = useMemo(
    () => (preferredComplexesData?.items ?? []).map((complex) => ({
      id: String(complex.id),
      label: complex.city ? `${complex.name} · ${complex.city}` : complex.name,
    })),
    [preferredComplexesData],
  );

  const { data: searchedComplexes = [] } = useQuery({
    queryKey: ['complex-search', preferredComplexSearch],
    queryFn: () => sportComplexApi.search(token!, preferredComplexSearch.trim(), 20),
    enabled: !!token && preferredComplexSearch.trim().length >= 2,
    staleTime: 60_000,
  });

  const availablePreferredComplexes = useMemo(
    () => searchedComplexes
      .map((complex) => ({
        id: String(complex.id),
        label: complex.city ? `${complex.name} · ${complex.city}` : complex.name,
      }))
      .filter((complex) => !preferredComplexIds.includes(Number(complex.id))),
    [searchedComplexes, preferredComplexIds],
  );

  const selectedPreferredComplexes = useMemo(
    () => preferredComplexIds.map((id) => {
      const found = activeComplexOptions.find((complex) => Number(complex.id) === id);
      return found ?? { id: String(id), label: `#${id}` };
    }),
    [activeComplexOptions, preferredComplexIds],
  );

  useEffect(() => {
    setSportCharacteristics((current) => {
      const next: Partial<Record<SportId, PlayerCharacteristic[]>> = {};

      selectedSports.forEach((sportId) => {
        const allowed = CHARACTERISTICS_BY_SPORT[sportId] ?? [];
        const currentValues = current[sportId] ?? [];
        next[sportId] = currentValues.filter((item) => allowed.includes(item));
      });

      return next;
    });
  }, [selectedSports]);

  const handleAvatarPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const size = await readImageSize(dataUrl);
    setCropImageSize(size);
    setCropSource(dataUrl);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
    setCropOpen(true);
    event.target.value = '';
  };

  const moveSport = (sportId: SportId, nextState: 'selected' | 'available') => {
    setSelectedSports((current) => {
      const withoutCurrent = current.filter((item) => item !== sportId);
      if (nextState === 'selected') {
        return [...withoutCurrent, sportId];
      }
      return withoutCurrent;
    });
  };

  const moveCharacteristic = (sportId: SportId, characteristicId: PlayerCharacteristic, nextState: 'selected' | 'available') => {
    setSportCharacteristics((current) => {
      const currentValues = current[sportId] ?? [];
      const withoutCurrent = currentValues.filter((item) => item !== characteristicId);

      return {
        ...current,
        [sportId]: nextState === 'selected' ? [...withoutCurrent, characteristicId] : withoutCurrent,
      };
    });
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const currentProfileState = useMemo(() => serializeProfileState({
    name,
    nickname,
    email,
    nationality,
    phoneCountry,
    phoneNumber,
    documentType,
    documentNumber,
    uniformSize,
    gender,
    selectedSports,
    sportCharacteristics,
    preferredComplexIds,
    addressStreet,
    addressNumber,
    addressComplement,
    addressNeighborhood,
    addressCity,
    addressState,
    addressZip,
  }), [
    name,
    nickname,
    email,
    nationality,
    phoneCountry,
    phoneNumber,
    documentType,
    documentNumber,
    uniformSize,
    gender,
    selectedSports,
    sportCharacteristics,
    preferredComplexIds,
    addressStreet,
    addressNumber,
    addressComplement,
    addressNeighborhood,
    addressCity,
    addressState,
    addressZip,
  ]);
  const hasUnsavedChanges = currentProfileState !== lastSavedState;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const profile = await usersApi.getProfile(token);
        if (cancelled) return;

        setName(profile.name);
        setNickname(profile.nickname ?? '');
        setAvatarUrl(profile.picture_url ?? profile.google_picture_url ?? '');
        setNationality(profile.country ?? currentUser.country ?? 'BR');
        setPhoneCountry(profile.phone_country ?? profile.country ?? currentUser.phoneCountry ?? currentUser.country ?? 'BR');
        setPhoneNumber(profile.phone_number ?? '');
        const nextDocumentType = (profile.document_type as DocumentType | null) ?? 'cpf';
        setDocumentType(nextDocumentType);
        setDocumentNumber(nextDocumentType === 'cpf' ? formatCpf(profile.document_number ?? '') : (profile.document_number ?? ''));
        setUniformSize((profile.uniform_size as UniformSize | null) ?? '');
        setGender(profile.gender ?? '');
        const nextSportCharacteristics = (profile.sport_characteristics ?? {}) as Partial<Record<SportId, PlayerCharacteristic[]>>;
        const nextSelectedSports = (profile.preferred_sports ?? []) as SportId[];
        setSportCharacteristics(nextSportCharacteristics);
        setSelectedSports(nextSelectedSports);
        setPreferredComplexIds(profile.preferred_complexes ?? []);
        setAddressStreet(profile.address_street ?? '');
        setAddressNumber(profile.address_number ?? '');
        setAddressComplement(profile.address_complement ?? '');
        setAddressNeighborhood(profile.address_neighborhood ?? '');
        setAddressCity(profile.address_city ?? '');
        setAddressState(profile.address_state ?? '');
        setAddressZip(profile.address_zip ?? '');
        setLastSavedState(serializeProfileState({
          name: profile.name,
          nickname: profile.nickname ?? '',
          email: profile.email,
          nationality: profile.country ?? currentUser.country ?? 'BR',
          phoneCountry: profile.phone_country ?? profile.country ?? currentUser.phoneCountry ?? currentUser.country ?? 'BR',
          phoneNumber: profile.phone_number ?? '',
          documentType: nextDocumentType,
          documentNumber: profile.document_number ?? '',
          uniformSize: (profile.uniform_size as UniformSize | null) ?? '',
          gender: profile.gender ?? '',
          selectedSports: nextSelectedSports,
          sportCharacteristics: nextSportCharacteristics,
          preferredComplexIds: profile.preferred_complexes ?? [],
          addressStreet: profile.address_street ?? '',
          addressNumber: profile.address_number ?? '',
          addressComplement: profile.address_complement ?? '',
          addressNeighborhood: profile.address_neighborhood ?? '',
          addressCity: profile.address_city ?? '',
          addressState: profile.address_state ?? '',
          addressZip: profile.address_zip ?? '',
        }));

        updateCurrentUser({
          name: profile.name,
          nickname: profile.nickname ?? undefined,
          avatarUrl: profile.picture_url ?? profile.google_picture_url ?? undefined,
          country: profile.country ?? undefined,
          phoneCountry: profile.phone_country ?? undefined,
          phoneNumber: profile.phone_number ?? undefined,
          documentType: (profile.document_type as DocumentType | null) ?? undefined,
          documentNumber: profile.document_number ?? undefined,
          uniformSize: (profile.uniform_size as UniformSize | null) ?? undefined,
          gender: profile.gender ?? undefined,
          level: (profile.level as PlayerLevel | null) ?? 'beginner',
          preferences: nextSelectedSports,
          sportCharacteristics: nextSportCharacteristics,
          preferredComplexes: profile.preferred_complexes?.length ? profile.preferred_complexes : undefined,
          wins: profile.wins,
          losses: profile.losses,
          draws: profile.draws,
          points: profile.points,
        });
      } catch (err) {
        if (cancelled) return;
        notify.error(t('profileLoadError'), err instanceof Error ? err.message : undefined);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleCropSave = async () => {
    if (!cropSource || !cropFrameRef.current) return;
    const frameSize = cropFrameRef.current.getBoundingClientRect().width;
    const cropped = await buildCroppedAvatar({
      source: cropSource,
      frameSize,
      zoom: cropZoom,
      offsetX: cropX,
      offsetY: cropY,
    });
    setCropOpen(false);

    if (token) {
      setUploadingAvatar(true);
      try {
        const { url } = await usersApi.uploadAvatar(token, cropped);
        setAvatarUrl(url);
        updateCurrentUser({ avatarUrl: url });
      } catch (err) {
        notify.error(t('avatarSaveError'), err instanceof Error ? err.message : undefined);
        setAvatarUrl(cropped);
      } finally {
        setUploadingAvatar(false);
      }
    } else {
      setAvatarUrl(cropped);
    }
  };

  const handleSave = async () => {
    if (savingProfile || !hasUnsavedChanges) return;

    const startedAt = Date.now();
    setSavingProfile(true);
    try {
      let profile = null;
      if (token) {
        profile = await usersApi.updateProfile(token, {
          name,
          email: email.trim() || null,
          nickname: nickname.trim() || null,
          document_type: documentType || null,
          document_number: documentNumber || null,
          phone_country: phoneCountry || null,
          phone_number: phoneNumber || null,
          country: nationality || null,
          uniform_size: uniformSize || null,
          gender: gender || null,
          level: null,
          preferred_sports: selectedSports.length > 0 ? selectedSports : null,
          sport_characteristics: Object.keys(sportCharacteristics).length > 0
            ? (sportCharacteristics as Record<string, string[]>)
            : null,
          preferred_complexes: preferredComplexIds.length > 0 ? preferredComplexIds : null,
          address_street: addressStreet.trim() || null,
          address_number: addressNumber.trim() || null,
          address_complement: addressComplement.trim() || null,
          address_neighborhood: addressNeighborhood.trim() || null,
          address_city: addressCity.trim() || null,
          address_state: addressState.trim() || null,
          address_zip: addressZip.trim() || null,
        });
      }
      const nextName = profile?.name ?? name;
      const nextNickname = profile?.nickname ?? nickname;
      const nextEmail = profile?.email ?? email;
      const nextCountry = profile?.country ?? nationality;
      const nextAvatarUrl = profile?.picture_url ?? profile?.google_picture_url ?? avatarUrl;
      const nextDocumentType = (profile?.document_type as DocumentType | null) ?? documentType;
      const nextDocumentNumber = profile?.document_number ?? documentNumber;
      const nextUniformSize = (profile?.uniform_size as UniformSize | null) ?? uniformSize;
      const nextGender = profile?.gender ?? gender;
      const nextPhoneCountry = profile?.phone_country ?? phoneCountry;
      const nextPhoneNumber = profile?.phone_number ?? phoneNumber;
      const nextSportCharacteristics = (profile?.sport_characteristics as Partial<Record<SportId, PlayerCharacteristic[]>> | null)
        ?? sportCharacteristics;

      setName(nextName);
      setNickname(nextNickname);
      setEmail(nextEmail);
      setAvatarUrl(nextAvatarUrl);
      setDocumentType(nextDocumentType);
      setDocumentNumber(nextDocumentType === 'cpf' ? formatCpf(nextDocumentNumber) : nextDocumentNumber);
      setUniformSize(nextUniformSize);
      setGender(nextGender);
      setLastSavedState(serializeProfileState({
        name: nextName,
        nickname: nextNickname,
        email: nextEmail,
        nationality: nextCountry ?? 'BR',
        phoneCountry: nextPhoneCountry ?? nextCountry ?? 'BR',
        phoneNumber: nextPhoneNumber,
        documentType: nextDocumentType,
        documentNumber: nextDocumentNumber,
        uniformSize: nextUniformSize,
        gender: nextGender,
        selectedSports,
        sportCharacteristics: nextSportCharacteristics,
        preferredComplexIds,
        addressStreet,
        addressNumber,
        addressComplement,
        addressNeighborhood,
        addressCity,
        addressState,
        addressZip,
      }));
      updateCurrentUser({
        name: nextName,
        email: nextEmail,
        nickname: nextNickname || undefined,
        country: nextCountry ?? undefined,
        phoneCountry: nextPhoneCountry,
        phoneNumber: nextPhoneNumber,
        avatarUrl: nextAvatarUrl || undefined,
        preferences: selectedSports,
        sportCharacteristics: nextSportCharacteristics,
        documentType: nextDocumentType,
        documentNumber: nextDocumentNumber,
        uniformSize: nextUniformSize || undefined,
        gender: nextGender || undefined,
        preferredComplexes: preferredComplexIds.length > 0 ? preferredComplexIds : undefined,
        wins: profile?.wins ?? currentUser.wins,
        losses: profile?.losses ?? currentUser.losses,
        draws: profile?.draws ?? currentUser.draws,
        points: profile?.points ?? currentUser.points,
      });
      notify.success(t('changesSaved'), nextName);
    } catch (err) {
      notify.error(t('profileSaveError'), err instanceof Error ? err.message : undefined);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < _MIN_SAVING_FEEDBACK_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, _MIN_SAVING_FEEDBACK_MS - elapsed));
      }
      setSavingProfile(false);
    }
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  const phonePrefix = COUNTRY_OPTIONS.find((option) => option.code === phoneCountry)?.dialCode ?? '';
  const characteristicLabel = (item: PlayerCharacteristic) => {
    if (item === 'right') return t('rightSide');
    if (item === 'left') return t('leftSide');
    if (item === 'goalkeeper') return t('goalkeeper');
    return t('midfielder');
  };
  useEffect(() => {
    if (!cropOpen || !cropFrameRef.current) return;

    const updateSize = () => {
      if (!cropFrameRef.current) return;
      setCropPreviewSize(cropFrameRef.current.getBoundingClientRect().width || 320);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(cropFrameRef.current);

    return () => observer.disconnect();
  }, [cropOpen]);

  const cropBounds = getCropBounds(cropPreviewSize, cropImageSize.width, cropImageSize.height, cropZoom);
  const horizontalRange = getSliderRange(cropBounds.maxOffsetX);
  const verticalRange = getSliderRange(cropBounds.maxOffsetY);

  useEffect(() => {
    setCropX((current) => clamp(current, -cropBounds.maxOffsetX, cropBounds.maxOffsetX));
    setCropY((current) => clamp(current, -cropBounds.maxOffsetY, cropBounds.maxOffsetY));
  }, [cropBounds.maxOffsetX, cropBounds.maxOffsetY]);

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-primary dark:text-lime-400">{t('profileSettings')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('profileSettingsIntro')}</p>
        </div>
      </header>

      {savingProfile
        ? createPortal(
          <div className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden">
            <div className="animate-loading-bar h-full bg-gradient-primary" />
          </div>,
          document.body,
        )
        : null}

      <div>
        <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="mb-6 rounded-2xl border border-primary/20 bg-background/40 p-4">
            <button type="button" onClick={() => inputRef.current?.click()} className="group mx-auto block relative">
              <Avatar className="h-28 w-28 border border-primary/25 shadow-neon">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-background/85 text-neon-cyan transition-smooth group-hover:border-primary/50">
                <Camera className="h-4 w-4" />
              </span>
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
            {currentUser.level && (
              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${levelColors[currentUser.level] ?? levelColors.beginner}`}>
                  <Trophy className="h-2.5 w-2.5" />
                  {t(currentUser.level)}
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('fullName')}>
              <Input value={name} onChange={(event) => setName(event.target.value)} className="border-border bg-background/60" />
            </Field>

            <Field label={t('nickname')}>
              <Input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={t('nicknamePlaceholder')} className="border-border bg-background/60" />
            </Field>

            <Field label={t('email')}>
              <Input value={email} readOnly disabled className="border-border bg-background/40 text-muted-foreground" />
            </Field>

            <Field label={t('nationality')}>
              <CountrySelect
                value={nationality}
                onValueChange={setNationality}
                language={language}
                placeholder={t('searchCountry')}
                emptyMessage={t('noCountryFound')}
              />
            </Field>

            <Field label={t('documentType')}>
              <Select
                value={documentType}
                onValueChange={(value) => {
                  const nextType = value as DocumentType;
                  setDocumentType(nextType);
                  setDocumentNumber((current) => nextType === 'cpf' ? formatCpf(current) : current);
                }}
              >
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {getDocumentOptions(nationality).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('documentNumber')}>
              <Input
                value={documentNumber}
                onChange={(event) => setDocumentNumber(
                  documentType === 'cpf' ? formatCpf(event.target.value) : event.target.value,
                )}
                placeholder={t('documentNumberPlaceholder')}
                inputMode={documentType === 'cpf' ? 'numeric' : undefined}
                maxLength={documentType === 'cpf' ? 14 : undefined}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('uniformSize')}>
              <Select value={uniformSize} onValueChange={(value) => setUniformSize(value as UniformSize)}>
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {getUniformSizeOptions().map((size) => (
                    <SelectItem key={size} value={size}>
                      {getUniformSizeLabel(size, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('gender')}>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="male">{t('male')}</SelectItem>
                  <SelectItem value="female">{t('female')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('phoneNumber')}>
              <div className="grid gap-3 sm:grid-cols-[110px_minmax(0,1fr)]">
                <CountrySelect
                  value={phoneCountry}
                  onValueChange={setPhoneCountry}
                  language={language}
                  compact
                  phoneMode
                  placeholder={t('searchCountry')}
                  emptyMessage={t('noCountryFound')}
                />
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(formatPhoneNumber(phoneCountry, event.target.value))}
                    placeholder={COUNTRY_OPTIONS.find((option) => option.code === phoneCountry)?.phonePlaceholder}
                    className="border-border bg-background/60 pl-10"
                  />
                </div>
              </div>
            </Field>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
            <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Endereço de Cobrança</span>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Rua / Logradouro">
                  <Input value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} placeholder="Ex: Rua das Flores" className="border-border bg-background/60" />
                </Field>
              </div>
              <Field label="Número">
                <Input value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="123" className="border-border bg-background/60" />
              </Field>
              <Field label="Complemento">
                <Input value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} placeholder="Apto 4, Bloco B" className="border-border bg-background/60" />
              </Field>
              <Field label="Bairro">
                <Input value={addressNeighborhood} onChange={(e) => setAddressNeighborhood(e.target.value)} placeholder="Centro" className="border-border bg-background/60" />
              </Field>
              <Field label="CEP">
                <Input
                  value={addressZip}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setAddressZip(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
                  }}
                  placeholder="00000-000"
                  className="border-border bg-background/60 font-mono"
                />
              </Field>
              <Field label="Cidade">
                <Input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="São Paulo" className="border-border bg-background/60" />
              </Field>
              <Field label="Estado (UF)">
                <Input value={addressState} onChange={(e) => setAddressState(e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} className="border-border bg-background/60 uppercase" />
              </Field>
            </div>
          </div>

          <div className="mt-5">
            <DragSelectField
              label={t('playerSports')}
              hint=""
              availableTitle={t('availableSports')}
              selectedTitle={t('selectedSports')}
              availableItems={availableSports.map((slug) => ({ id: slug, label: sportLabelFromSlug[slug] ?? sportName(slug) }))}
              selectedItems={selectedSports.map((slug) => ({ id: slug, label: sportLabelFromSlug[slug] ?? sportName(slug) }))}
              onMove={(id, nextState) => moveSport(id as SportId, nextState)}
            />
          </div>

          {selectedSports
            .filter((sportId) => (CHARACTERISTICS_BY_SPORT[sportId] ?? []).length > 0)
            .map((sportId) => {
              const supportedCharacteristics = CHARACTERISTICS_BY_SPORT[sportId] ?? [];
              const selectedForSport = sportCharacteristics[sportId] ?? [];
              const availableForSport = supportedCharacteristics.filter((item) => !selectedForSport.includes(item));

              return (
                <div key={sportId} className="mt-5 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
                  <div className="mb-4">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {sportName(sportId)} · {t('playerCharacteristics')}
                    </span>
                  </div>
                  <DragSelectField
                    label={t('selectedCharacteristics')}
                    hint=""
                    availableTitle={t('availableCharacteristics')}
                    selectedTitle={t('selectedCharacteristics')}
                    availableItems={availableForSport.map((item) => ({ id: item, label: characteristicLabel(item) }))}
                    selectedItems={selectedForSport.map((item) => ({ id: item, label: characteristicLabel(item) }))}
                    onMove={(id, nextState) => moveCharacteristic(sportId, id as PlayerCharacteristic, nextState)}
                  />
                </div>
              );
            })}

          {token && (
            <div className="mt-5">
              <div className="rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('preferredComplexes')}</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={preferredComplexSearch}
                    onChange={(event) => setPreferredComplexSearch(event.target.value)}
                    placeholder={t('searchComplexPlaceholder')}
                    className="border-border bg-background/60 pl-9 text-sm"
                  />
                </div>

                <div className="mt-3 min-h-[56px] rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('preferredComplexes')}</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPreferredComplexes.map((complex) => (
                      <button
                        key={complex.id}
                        type="button"
                        onClick={() => setPreferredComplexIds((current) => current.filter((id) => id !== Number(complex.id)))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.22)]"
                      >
                        <span>{complex.label}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                    {selectedPreferredComplexes.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-border bg-background/40 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('allComplexes')}</div>
                  {preferredComplexSearch.trim().length < 2 ? (
                    <div className="text-xs text-muted-foreground">{t('searchComplexPlaceholder')}</div>
                  ) : availablePreferredComplexes.length === 0 ? (
                    <div className="text-xs text-muted-foreground">{t('noComplexFound')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availablePreferredComplexes.map((complex) => (
                        <button
                          key={complex.id}
                          type="button"
                          onClick={() => {
                            const numericId = Number(complex.id);
                            setPreferredComplexIds((current) => current.includes(numericId) ? current : [...current, numericId]);
                            setPreferredComplexSearch('');
                          }}
                          className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-foreground transition-smooth hover:border-primary/30"
                        >
                          {complex.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={savingProfile || !hasUnsavedChanges}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110 disabled:opacity-60"
            >
              {savingProfile
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                : <Save className="h-4 w-4" />}
            </button>
          </div>
        </section>
      </div>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-xl border-border bg-gradient-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black">{t('editAvatar')}</DialogTitle>
            <DialogDescription>{t('editAvatarDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div
              ref={cropFrameRef}
              className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-primary/25 bg-background/60"
            >
              {cropSource ? (
                <img
                  src={cropSource}
                  alt=""
                  className="absolute left-1/2 top-1/2 max-w-none"
                  style={{
                    width: `${cropBounds.width}px`,
                    height: `${cropBounds.height}px`,
                    transform: `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px))`,
                  }}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/25" />
            </div>

            <div className="space-y-4">
              <SliderField label={t('zoom')}>
                <Slider value={[cropZoom]} min={1} max={2.4} step={0.01} onValueChange={([value]) => setCropZoom(value)} />
              </SliderField>
              <SliderField label={t('horizontalPosition')}>
                <Slider
                  value={[clamp(cropX, horizontalRange.min, horizontalRange.max)]}
                  min={horizontalRange.min}
                  max={horizontalRange.max}
                  step={1}
                  onValueChange={([value]) => setCropX(value)}
                />
              </SliderField>
              <SliderField label={t('verticalPosition')}>
                <Slider
                  value={[clamp(cropY, verticalRange.min, verticalRange.max)]}
                  min={verticalRange.min}
                  max={verticalRange.max}
                  step={1}
                  onValueChange={([value]) => setCropY(value)}
                />
              </SliderField>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleCropSave}
              disabled={uploadingAvatar}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:opacity-60"
            >
              {uploadingAvatar && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {t('saveAvatar')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

const SliderField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    {children}
  </div>
);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const buildCroppedAvatar = async ({
  source,
  frameSize,
  zoom,
  offsetX,
  offsetY,
}: {
  source: string;
  frameSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const outputSize = 480;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      const baseScale = Math.max(frameSize / image.width, frameSize / image.height);
      const drawScale = baseScale * zoom;
      const drawWidth = image.width * drawScale;
      const drawHeight = image.height * drawScale;
      const ratio = outputSize / frameSize;
      const drawX = (outputSize - drawWidth * ratio) / 2 + offsetX * ratio;
      const drawY = (outputSize - drawHeight * ratio) / 2 + offsetY * ratio;

      context.clearRect(0, 0, outputSize, outputSize);
      context.drawImage(image, drawX, drawY, drawWidth * ratio, drawHeight * ratio);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    image.onerror = reject;
    image.src = source;
  });

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getSliderRange = (maxOffset: number) => (
  maxOffset > 0
    ? { min: -maxOffset, max: maxOffset }
    : { min: -1, max: 1 }
);

const getCropBounds = (frameSize: number, imageWidth: number, imageHeight: number, zoom: number) => {
  const coverScale = Math.max(frameSize / imageWidth, frameSize / imageHeight);
  const width = imageWidth * coverScale * zoom;
  const height = imageHeight * coverScale * zoom;

  return {
    width,
    height,
    maxOffsetX: Math.max(0, (width - frameSize) / 2),
    maxOffsetY: Math.max(0, (height - frameSize) / 2),
  };
};

const readImageSize = (source: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = source;
  });

const getDocumentOptions = (nationality: string): { value: DocumentType; label: string }[] => {
  // Brazil: CPF and RG are most common
  if (nationality === 'BR') {
    return [
      { value: 'cpf', label: 'CPF' },
      { value: 'rg', label: 'RG' },
      { value: 'passport', label: 'Passport' },
    ];
  }
  // Portugal: CC (Cartão de Cidadão) is the main document
  if (nationality === 'PT') {
    return [
      { value: 'cc', label: 'Cartão de Cidadão' },
      { value: 'passport', label: 'Passport' },
    ];
  }
  // Default for other countries
  return [
    { value: 'passport', label: 'Passport' },
    { value: 'cpf', label: 'CPF / National ID' },
    { value: 'rg', label: 'RG / ID Card' },
    { value: 'cc', label: 'CC / Citizen Card' },
  ];
};

const getUniformSizeOptions = (): UniformSize[] => ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const getUniformSizeLabel = (size: UniformSize, language: string) => {
  if (language !== 'pt-BR') return size;

  const labels: Record<UniformSize, string> = {
    XS: 'PP',
    S: 'P',
    M: 'M',
    L: 'G',
    XL: 'GG',
    XXL: 'XGG',
  };

  return labels[size];
};

const serializeProfileState = ({
  name,
  nickname,
  email,
  nationality,
  phoneCountry,
  phoneNumber,
  documentType,
  documentNumber,
  uniformSize,
  gender,
  selectedSports,
  sportCharacteristics,
  preferredComplexIds,
  addressStreet,
  addressNumber,
  addressComplement,
  addressNeighborhood,
  addressCity,
  addressState,
  addressZip,
}: {
  name: string;
  nickname: string;
  email: string;
  nationality: string;
  phoneCountry: string;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  uniformSize: UniformSize | '';
  gender: string;
  selectedSports: SportId[];
  sportCharacteristics: Partial<Record<SportId, PlayerCharacteristic[]>>;
  preferredComplexIds: number[];
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}) => JSON.stringify({
  name: name.trim(),
  nickname: nickname.trim(),
  email: email.trim(),
  nationality,
  phoneCountry,
  phoneNumber,
  documentType,
  documentNumber: documentType === 'cpf' ? documentNumber.replace(/\D/g, '') : documentNumber.trim(),
  uniformSize,
  gender,
  selectedSports,
  sportCharacteristics: Object.fromEntries(
    Object.entries(sportCharacteristics)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sportId, values]) => [sportId, [...(values ?? [])]]),
  ),
  preferredComplexIds: [...preferredComplexIds].sort((a, b) => a - b),
  addressStreet: addressStreet.trim(),
  addressNumber: addressNumber.trim(),
  addressComplement: addressComplement.trim(),
  addressNeighborhood: addressNeighborhood.trim(),
  addressCity: addressCity.trim(),
  addressState: addressState.trim(),
  addressZip: addressZip.trim(),
});

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export default ProfileSettings;
