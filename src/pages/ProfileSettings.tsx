import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Phone, Save, ShieldCheck, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CountrySelect } from '@/components/CountrySelect';
import { DragSelectField } from '@/components/DragSelectField';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { COUNTRY_OPTIONS, formatPhoneNumber, getCountryLabel } from '@/data/countries';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { usersApi } from '@/lib/api';
import type { DocumentType, PaymentMethod, PlayerCharacteristic, PlayerLevel, SportId, UniformSize } from '@/types';

const CHARACTERISTICS_BY_SPORT: Partial<Record<SportId, PlayerCharacteristic[]>> = {
  footvolley: ['right', 'left'],
  'beach-tennis': ['right', 'left'],
  'beach-soccer': ['goalkeeper', 'midfielder'],
};

const _MIN_SAVING_FEEDBACK_MS = 800;

const ProfileSettings = () => {
  const { currentUser, updateCurrentUser, token } = useSession();
  const { language, t, sportName } = useLanguage();
  const { toast } = useToast();
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
  const [preferredClassPaymentMethod, setPreferredClassPaymentMethod] = useState<PaymentMethod | ''>(
    currentUser.preferredClassPaymentMethod ?? '',
  );
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
    preferredClassPaymentMethod: currentUser.preferredClassPaymentMethod ?? '',
    selectedSports: currentUser.preferences,
    sportCharacteristics: currentUser.sportCharacteristics ?? {},
  }));

  const availableSports = useMemo(
    () => SPORTS.map((sport) => sport.id).filter((sportId) => !selectedSports.includes(sportId)),
    [selectedSports],
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
    preferredClassPaymentMethod,
    selectedSports,
    sportCharacteristics,
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
    preferredClassPaymentMethod,
    selectedSports,
    sportCharacteristics,
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
        setPreferredClassPaymentMethod((profile.preferred_class_payment_method as PaymentMethod | null) ?? '');
        const nextSportCharacteristics = (profile.sport_characteristics ?? {}) as Partial<Record<SportId, PlayerCharacteristic[]>>;
        const nextSelectedSports = (profile.preferred_sports ?? []) as SportId[];
        setSportCharacteristics(nextSportCharacteristics);
        setSelectedSports(nextSelectedSports);
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
          preferredClassPaymentMethod: (profile.preferred_class_payment_method as PaymentMethod | null) ?? '',
          selectedSports: nextSelectedSports,
          sportCharacteristics: nextSportCharacteristics,
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
          level: (profile.level as PlayerLevel | null) ?? 'beginner',
          preferences: nextSelectedSports,
          sportCharacteristics: nextSportCharacteristics,
          preferredClassPaymentMethod: (profile.preferred_class_payment_method as PaymentMethod | null) ?? undefined,
          wins: profile.wins,
          losses: profile.losses,
          draws: profile.draws,
        });
      } catch (err) {
        if (cancelled) return;
        toast({
          title: t('profileLoadError'),
          description: err instanceof Error ? err.message : undefined,
          variant: 'destructive',
        });
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
        toast({
          title: t('avatarSaveError'),
          description: err instanceof Error ? err.message : undefined,
          variant: 'destructive',
        });
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
          level: null,
          preferred_sports: selectedSports.length > 0 ? selectedSports : null,
          sport_characteristics: Object.keys(sportCharacteristics).length > 0
            ? (sportCharacteristics as Record<string, string[]>)
            : null,
          preferred_class_payment_method: preferredClassPaymentMethod || null,
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
        preferredClassPaymentMethod: (profile?.preferred_class_payment_method as PaymentMethod | null) ?? preferredClassPaymentMethod,
        selectedSports,
        sportCharacteristics: nextSportCharacteristics,
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
        preferredClassPaymentMethod: preferredClassPaymentMethod || undefined,
        wins: profile?.wins ?? currentUser.wins,
        losses: profile?.losses ?? currentUser.losses,
        draws: profile?.draws ?? currentUser.draws,
      });
    } catch (err) {
      toast({
        title: t('profileSaveError'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
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

  const wins = currentUser.wins ?? 0;
  const losses = currentUser.losses ?? 0;
  const draws = currentUser.draws ?? 0;
  const phonePrefix = COUNTRY_OPTIONS.find((option) => option.code === phoneCountry)?.dialCode ?? '';
  const phoneSummary = phoneNumber ? `${phonePrefix} ${phoneNumber}` : '';
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
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('profileSettings')}</p>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <aside className="order-1 space-y-5 xl:order-2">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('quickPreview')}</h2>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-background/40 p-4">
              <button type="button" onClick={() => inputRef.current?.click()} className="group relative mx-auto block">
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

              <div className="mt-4 text-center">
                <div className="font-display text-2xl font-black">{name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-neon-cyan">{t('playerCard')}</div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label={t('wins')} value={String(wins)} accent="text-neon-cyan" />
                <StatCard label={t('losses')} value={String(losses)} accent="text-live" />
                <StatCard label={t('draws')} value={String(draws)} accent="text-primary-glow" />
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <PreviewRow icon={<ShieldCheck className="h-4 w-4 text-neon-cyan" />} label={t('nationality')} value={getCountryLabel(nationality, language)} />
                {phoneSummary ? <PreviewRow icon={<Phone className="h-4 w-4 text-neon-cyan" />} label={t('phoneNumber')} value={phoneSummary} /> : null}
                <PreviewRow
                  icon={<Trophy className="h-4 w-4 text-neon-cyan" />}
                  label={t('playerSports')}
                  value={selectedSports.length > 0 ? selectedSports.map((sportId) => sportName(sportId)).join(' · ') : '-'}
                />
                {selectedSports
                  .filter((sportId) => (sportCharacteristics[sportId] ?? []).length > 0)
                  .map((sportId) => (
                    <PreviewRow
                      key={sportId}
                      icon={<Trophy className="h-4 w-4 text-neon-cyan" />}
                      label={`${sportName(sportId)} · ${t('playerCharacteristics')}`}
                      value={(sportCharacteristics[sportId] ?? []).map((item) => characteristicLabel(item)).join(' · ')}
                    />
                  ))}
                {uniformSize ? (
                  <PreviewRow
                    icon={<ShieldCheck className="h-4 w-4 text-neon-cyan" />}
                    label={t('uniformSize')}
                    value={getUniformSizeLabel(uniformSize, language)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="order-2 rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6 xl:order-1">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('fullName')}>
              <Input value={name} onChange={(event) => setName(event.target.value)} className="border-border bg-background/60" />
            </Field>

            <Field label={t('nickname')}>
              <Input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={t('nicknamePlaceholder')} className="border-border bg-background/60" />
            </Field>

            <Field label={t('email')}>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} className="border-border bg-background/60" />
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

            <Field label={t('preferredClassPaymentMethod')}>
              <Select value={preferredClassPaymentMethod} onValueChange={(v) => setPreferredClassPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="pix">{t('pix')}</SelectItem>
                  <SelectItem value="credit-card">{t('creditCard')}</SelectItem>
                  <SelectItem value="debit-card">{t('debitCard')}</SelectItem>
                  <SelectItem value="pay-on-site">{t('payOnSite')}</SelectItem>
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

          <div className="mt-5">
            <DragSelectField
              label={t('playerSports')}
              hint=""
              availableTitle={t('availableSports')}
              selectedTitle={t('selectedSports')}
              availableItems={availableSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
              selectedItems={selectedSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
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

const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className={`mt-1 font-display text-2xl font-black ${accent}`}>{value}</div>
  </div>
);

const SliderField = ({ label, children }: { label: string; children: React.ReactNode }) => (
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
  preferredClassPaymentMethod,
  selectedSports,
  sportCharacteristics,
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
  preferredClassPaymentMethod: PaymentMethod | '';
  selectedSports: SportId[];
  sportCharacteristics: Partial<Record<SportId, PlayerCharacteristic[]>>;
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
  preferredClassPaymentMethod,
  selectedSports,
  sportCharacteristics: Object.fromEntries(
    Object.entries(sportCharacteristics)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sportId, values]) => [sportId, [...(values ?? [])]]),
  ),
});

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export default ProfileSettings;
