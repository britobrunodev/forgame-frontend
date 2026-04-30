import { useMemo, useState } from 'react';
import { Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { BackgroundUploadField, backgroundPreviewStyle } from '@/components/BackgroundUploadField';
import { CountrySelect } from '@/components/CountrySelect';
import { DragSelectField } from '@/components/DragSelectField';
import { SportIcon } from '@/components/SportIcon';
import { COUNTRY_OPTIONS, formatPostalCode, getCountryLabel } from '@/data/countries';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useSession } from '@/session';

type SportOption = 'footvolley' | 'beach-tennis' | 'beach-soccer' | 'volleyball';
const SPORT_ORDER: SportOption[] = ['footvolley', 'beach-tennis', 'beach-soccer', 'volleyball'];

const SportComplexSettings = () => {
  const { language, t, sportName } = useLanguage();
  const { isOwnerMode } = useSession();
  const { toast } = useToast();
  const [complexName, setComplexName] = useState('Arena Joga Junto Copacabana');
  const [country, setCountry] = useState('BR');
  const [city, setCity] = useState('Rio de Janeiro');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('Avenida Atlântica');
  const [addressNumber, setAddressNumber] = useState('1702');
  const [addressComplement, setAddressComplement] = useState('');
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');
  const [selectedBackgroundOffsetY, setSelectedBackgroundOffsetY] = useState(0);
  const [selectedSports, setSelectedSports] = useState<SportOption[]>(['footvolley', 'beach-tennis']);

  const availableSports = useMemo(
    () => SPORT_ORDER.filter((sport) => !selectedSports.includes(sport)),
    [selectedSports],
  );

  if (!isOwnerMode) {
    return (
      <div className="max-w-3xl">
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

  const handleCreate = () => {
    toast({
      title: t('sportComplexPublished'),
      description: `${complexName} · ${street}, ${addressNumber} · ${getCountryLabel(country, language)}`,
    });
  };


  const fullAddress = `${street}${addressNumber ? `, ${addressNumber}` : ''}${addressComplement ? ` · ${addressComplement}` : ''}`;
  const postalPlaceholder = COUNTRY_OPTIONS.find((option) => option.code === country)?.postalPlaceholder ?? '';

  return (
    <div className="max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('sportComplexBuilder')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('sportComplexBuilderIntro')}</p>
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
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110"
            >
              <Building2 className="h-4 w-4" />
              {t('createSportComplex')}
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
              <div className="relative -mx-4 -mt-4 mb-4 h-28 overflow-hidden rounded-t-2xl">
                {selectedBackgroundImage ? (
                  <>
                    <div className="absolute inset-0" style={backgroundPreviewStyle(selectedBackgroundImage, selectedBackgroundOffsetY)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/15" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-secondary" />
                    <div className="absolute inset-0 hex-grid opacity-25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/15" />
                  </>
                )}
                <div className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">
                  {selectedSports.length > 0 ? sportName(selectedSports[0]) : t('sportComplexBuilder')}
                </div>
              </div>
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
