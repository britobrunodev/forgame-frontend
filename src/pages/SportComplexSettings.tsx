import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, Loader2, MapPin, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { BackgroundUploadField } from '@/components/BackgroundUploadField';
import { CountrySelect } from '@/components/CountrySelect';
import { DragSelectField } from '@/components/DragSelectField';
import { SportIcon } from '@/components/SportIcon';
import { COUNTRY_OPTIONS, formatPostalCode, getCountryLabel } from '@/data/countries';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useSession } from '@/session';
import { sportComplexApi } from '@/lib/api';

type SportOption = 'footvolley' | 'beach-tennis' | 'beach-soccer' | 'volleyball';
const SPORT_ORDER: SportOption[] = ['footvolley', 'beach-tennis', 'beach-soccer', 'volleyball'];

const SportComplexSettings = () => {
  const navigate = useNavigate();
  const { complexId } = useParams<{ complexId: string }>();
  const { language, t, sportName } = useLanguage();
  const { currentUser, isGestorMode, token } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(complexId);
  const canManageComplexes = currentUser.isAdmin || isGestorMode;
  const [complexName, setComplexName] = useState('');
  const [country, setCountry] = useState('BR');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');
  const [selectedBackgroundOffsetY, setSelectedBackgroundOffsetY] = useState(0);
  const [selectedSports, setSelectedSports] = useState<SportOption[]>(['footvolley', 'beach-tennis']);

  const { data: complexData, isLoading: isLoadingComplex } = useQuery({
    queryKey: ['sport-complex', complexId],
    queryFn: () => sportComplexApi.get(token!, complexId!),
    enabled: !!token && !!complexId && canManageComplexes,
  });

  const availableSports = useMemo(
    () => SPORT_ORDER.filter((sport) => !selectedSports.includes(sport)),
    [selectedSports],
  );

  useEffect(() => {
    if (!complexData) return;
    setComplexName(complexData.name);
    setCountry(complexData.country ?? 'BR');
    setCity(complexData.city ?? '');
    setZipCode(complexData.zip_code ?? '');
    setStreet(complexData.street ?? '');
    setAddressNumber(complexData.address_number ?? '');
    setAddressComplement(complexData.address_complement ?? '');
    setSelectedBackgroundImage(complexData.image_url ?? '');
    setSelectedBackgroundOffsetY(complexData.image_offset_y ?? 0);
  }, [complexData]);

  if (!canManageComplexes) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('createSportComplex')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  const moveSport = (sportId: SportOption, nextState: 'selected' | 'available') => {
    setSelectedSports((current) => {
      const withoutCurrent = current.filter((item) => item !== sportId);
      if (nextState === 'selected') {
        return [...withoutCurrent, sportId].sort((left, right) => SPORT_ORDER.indexOf(left) - SPORT_ORDER.indexOf(right));
      }
      return withoutCurrent;
    });
  };

  const handleSubmit = async () => {
    if (!complexName.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: complexName.trim(),
        city: city || null,
        country: country || null,
        zip_code: zipCode || null,
        street: street || null,
        address_number: addressNumber || null,
        address_complement: addressComplement || null,
        image_offset_y: selectedBackgroundOffsetY,
      };
      const saved = isEditing
        ? await sportComplexApi.update(token!, complexId!, payload)
        : await sportComplexApi.create(token!, payload);
      if (selectedBackgroundImage && selectedBackgroundImage.startsWith('data:')) {
        await sportComplexApi.uploadImage(token!, saved.id, selectedBackgroundImage);
      }
      await queryClient.invalidateQueries({ queryKey: ['sport-complexes'] });
      if (complexId) {
        await queryClient.invalidateQueries({ queryKey: ['sport-complex', complexId] });
      }
      toast({
        title: isEditing ? t('saveChanges') : t('sportComplexPublished'),
        description: `${complexName} · ${street}${addressNumber ? `, ${addressNumber}` : ''} · ${getCountryLabel(country, language)}`,
      });
      navigate('/management/complexs');
    } catch (err) {
      toast({
        title: isEditing ? 'Erro ao atualizar complexo' : 'Erro ao criar complexo',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };


  const fullAddress = `${street}${addressNumber ? `, ${addressNumber}` : ''}${addressComplement ? ` · ${addressComplement}` : ''}`;
  const postalPlaceholder = COUNTRY_OPTIONS.find((option) => option.code === country)?.postalPlaceholder ?? '';

  if (isEditing && isLoadingComplex) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/complexs')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('sportComplexBuilder')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('sportComplexBuilderIntro')}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('complexName')}>
              <Input
                value={complexName}
                onChange={(event) => setComplexName(event.target.value)}
                placeholder={t('complexNamePlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('country')}>
              <CountrySelect value={country} onValueChange={(value) => {
                setCountry(value);
                setZipCode((current) => formatPostalCode(value, current));
              }} language={language} />
            </Field>

            <Field label={t('city')}>
              <Input
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('cityPlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('zipCode')}>
              <Input
                value={zipCode}
                onChange={(event) => setZipCode(formatPostalCode(country, event.target.value))}
                placeholder={postalPlaceholder || t('zipCodePlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('street')}>
              <Input
                required
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder={t('streetPlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('addressNumber')}>
              <Input
                required
                value={addressNumber}
                onChange={(event) => setAddressNumber(event.target.value)}
                placeholder={t('addressNumberPlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('addressComplement')}>
              <Input
                value={addressComplement}
                onChange={(event) => setAddressComplement(event.target.value)}
                placeholder={t('addressComplementPlaceholder')}
                className="border-border bg-background/60"
              />
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

          <div className="mt-5">
            <DragSelectField
              label={t('sportsAvailable')}
              hint={t('dragSportsHint')}
              availableTitle={t('availableSports')}
              selectedTitle={t('selectedSports')}
              availableItems={availableSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
              selectedItems={selectedSports.map((sportId) => ({ id: sportId, label: sportName(sportId) }))}
              onMove={(id, nextState) => moveSport(id as SportOption, nextState)}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !complexName.trim()}
              title={isEditing ? t('saveChanges') : t('createSportComplex')}
              className={`inline-flex items-center justify-center rounded-xl border transition-smooth disabled:cursor-not-allowed disabled:opacity-60 ${
                isEditing
                  ? 'h-11 w-11 border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] hover:bg-primary/16'
                  : 'gap-2 border-border bg-background/55 px-4 py-3 text-sm font-semibold text-foreground hover:border-neon-cyan/35 hover:text-neon-cyan'
              }`}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <Save className="h-4 w-4" />
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  <span>{t('createSportComplex')}</span>
                </>
              )}
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
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">{t('sportComplexBuilder')}</div>
              <h3 className="mt-2 font-display text-2xl font-black leading-tight">{complexName}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <PreviewRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} label={t('fullAddress')} value={fullAddress} />
                <PreviewRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} label={t('country')} value={getCountryLabel(country, language)} />
                <PreviewRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} label={t('city')} value={city} />
                <PreviewRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} label={t('zipCode')} value={zipCode || '-'} />
                <PreviewRow icon={<Building2 className="h-4 w-4 text-neon-cyan" />} label={t('sportsAvailable')} value={String(selectedSports.length)} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedSports.map((sportId) => (
                  <span key={sportId} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow">
                    <SportIcon sportId={sportId} className="h-3.5 w-3.5" />
                    {sportName(sportId)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('sportsAvailable')}</h2>
            </div>
            <div className="space-y-3">
              {SPORTS.map((sport) => (
                <div key={sport.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4">
                  <SportIcon sportId={sport.id} className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{sportName(sport.id)}</span>
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

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default SportComplexSettings;
