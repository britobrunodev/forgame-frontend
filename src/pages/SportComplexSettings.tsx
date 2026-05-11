import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, Loader2, Save, ShieldCheck } from 'lucide-react';
import { BackgroundUploadField } from '@/components/BackgroundUploadField';
import { CountrySelect } from '@/components/CountrySelect';
import { DragSelectField } from '@/components/DragSelectField';
import { COUNTRY_OPTIONS, formatPostalCode, getCountryLabel } from '@/data/countries';
import { useLanguage } from '@/i18n';
import { notify } from '@/lib/notify';
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
  const queryClient = useQueryClient();
  const isEditing = Boolean(complexId);
  const canManageComplexes = currentUser.isAdmin || isGestorMode;
  const [complexName, setComplexName] = useState('');
  const [country, setCountry] = useState('BR');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');
  const [selectedBackgroundOffsetX, setSelectedBackgroundOffsetX] = useState(0);
  const [selectedBackgroundOffsetY, setSelectedBackgroundOffsetY] = useState(0);
  const [selectedBackgroundZoom, setSelectedBackgroundZoom] = useState(1);
  const [selectedSports, setSelectedSports] = useState<SportOption[]>([]);

  const { data: complexData, isLoading: isLoadingComplex } = useQuery({
    queryKey: ['complex', complexId],
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
    setNeighborhood(complexData.neighborhood ?? '');
    setZipCode(complexData.zip_code ?? '');
    setStreet(complexData.street ?? '');
    setAddressNumber(complexData.address_number ?? '');
    setAddressComplement(complexData.address_complement ?? '');
    setSelectedBackgroundImage(complexData.image_url ?? '');
    setSelectedBackgroundOffsetX(complexData.image_offset_x ?? 0);
    setSelectedBackgroundOffsetY(complexData.image_offset_y ?? 0);
    setSelectedBackgroundZoom(complexData.image_zoom ?? 1);
    setSelectedSports((complexData.available_sports ?? []) as SportOption[]);
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

  const translateImageError = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes('too large') || msg.includes('entity too large') || msg.includes('413')) {
        return 'Imagem anexada muito grande.';
      }
      if (msg.includes('invalid image') || msg.includes('invalid file')) {
        return 'Arquivo de imagem inválido.';
      }
      return err.message;
    }
    return 'Erro ao enviar imagem.';
  };

  const handleSubmit = async () => {
    if (!complexName.trim()) return;
    setSubmitting(true);
    const hasNewImage = selectedBackgroundImage.startsWith('data:');
    try {
      const payload = {
        name: complexName.trim(),
        city: city || null,
        neighborhood: neighborhood || null,
        country: country || null,
        zip_code: zipCode || null,
        street: street || null,
        address_number: addressNumber || null,
        address_complement: addressComplement || null,
        image_offset_x: Math.round(selectedBackgroundOffsetX),
        image_offset_y: Math.round(selectedBackgroundOffsetY),
        image_zoom: selectedBackgroundZoom,
        available_sports: selectedSports,
      };

      if (isEditing) {
        if (hasNewImage) {
          try {
            const { url } = await sportComplexApi.uploadImage(token!, complexId!, selectedBackgroundImage);
            setSelectedBackgroundImage(url);
          } catch (imgErr) {
            notify.error('Erro na imagem', translateImageError(imgErr));
            return;
          }
        }
        await sportComplexApi.update(token!, complexId!, payload);
      } else {
        const saved = await sportComplexApi.create(token!, payload);
        if (hasNewImage) {
          try {
            const { url } = await sportComplexApi.uploadImage(token!, saved.id, selectedBackgroundImage);
            setSelectedBackgroundImage(url);
          } catch (imgErr) {
            await sportComplexApi.delete(token!, saved.id).catch(() => {});
            notify.error('Erro na imagem', translateImageError(imgErr));
            return;
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['complexes'] });
      await queryClient.invalidateQueries({ queryKey: ['complexes-public'] });
      if (complexId) {
        await queryClient.invalidateQueries({ queryKey: ['complex', complexId] });
      }
      notify.success(
        isEditing ? t('saveChanges') : t('sportComplexPublished'),
        `${complexName} · ${street}${addressNumber ? `, ${addressNumber}` : ''} · ${getCountryLabel(country, language)}`,
      );
      navigate('/management/complexes');
    } catch (err) {
      notify.error(
        isEditing ? 'Erro ao atualizar complexo' : 'Erro ao criar complexo',
        err instanceof Error ? err.message : 'Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };


  const postalPlaceholder = COUNTRY_OPTIONS.find((option) => option.code === country)?.postalPlaceholder ?? '';

  if (isEditing && isLoadingComplex) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/complexes')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">
            {isEditing ? t('editSportComplex') : t('sportComplexBuilder')}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isEditing ? t('editSportComplexIntro') : t('sportComplexBuilderIntro')}
          </p>
        </div>
      </header>

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

          <Field label={t('neighborhood')}>
            <Input
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              placeholder={t('neighborhoodPlaceholder')}
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

        <div className="mt-5 max-w-[280px] mx-auto md:mx-0">
          <BackgroundUploadField
            label={t('complexBackground')}
            buttonLabel={t('selectImage')}
            image={selectedBackgroundImage}
            offsetX={selectedBackgroundOffsetX}
            offsetY={selectedBackgroundOffsetY}
            zoom={selectedBackgroundZoom}
            onOffsetXChange={setSelectedBackgroundOffsetX}
            onOffsetYChange={setSelectedBackgroundOffsetY}
            onZoomChange={setSelectedBackgroundZoom}
            onImageChange={async (file) => {
              setSelectedBackgroundImage(await readFileAsDataUrl(file));
              setSelectedBackgroundOffsetX(0);
              setSelectedBackgroundOffsetY(0);
              setSelectedBackgroundZoom(1);
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
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default SportComplexSettings;
