import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { getCountryLabel } from '@/data/countries';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { sportComplexApi } from '@/lib/api';

const SportComplexesManagement = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { currentUser, isGestorMode, token } = useSession();
  const [page, setPage] = useState(1);
  const perPage = 12;
  const canManageComplexes = currentUser.isAdmin || isGestorMode;

  const { data, isLoading } = useQuery({
    queryKey: ['complexes', page],
    queryFn: () => sportComplexApi.list(token!, page, perPage),
    enabled: !!token && canManageComplexes,
  });
  const complexes = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalItems = data?.total ?? 0;

  if (!canManageComplexes) {
    return (
      <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))]">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('sportComplexes')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('sportComplexes')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('sportComplexesIntro')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/management/complexes/new')}
          title={t('createSportComplex')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {complexes.map((complex) => (
              <article key={complex.id} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-display text-xs font-bold uppercase tracking-[0.12em] text-foreground">{complex.name}</div>
                    {buildComplexAddress(complex, { includeComplement: false }) && (
                      <div className="mt-1 truncate text-xs text-muted-foreground">{buildComplexAddress(complex, { includeComplement: false })}</div>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${complex.is_active ? 'bg-live/10 text-live' : 'bg-muted/60 text-muted-foreground'}`}>
                    {complex.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">{t('city')}</span>
                    <div className="mt-0.5 truncate">{complex.city || '-'}</div>
                  </div>
                  <div>
                    <span className="font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">{t('country')}</span>
                    <div className="mt-0.5 truncate">{complex.country ? getCountryLabel(complex.country, language) : '-'}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 border-t border-border/50 pt-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/management/complexes/${complex.id}/edit`)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/management/complexes/${complex.id}/preferences`)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {t('preferences')}
                  </button>
                </div>
              </article>
            ))}
            {complexes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background/25 px-4 py-10 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
              </div>
            ) : null}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[minmax(0,2.4fr)_minmax(100px,0.7fr)_minmax(100px,0.7fr)_200px] gap-4 border-t border-b border-border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
                <div className="text-center">{t('complexName')}</div>
                <div>{t('city')}</div>
                <div>{t('country')}</div>
                <div className="text-center">Configurações</div>
              </div>
              <div className="mt-2 space-y-2">
                {complexes.map((complex) => (
                  <div
                    key={complex.id}
                    className="grid grid-cols-[minmax(0,2.4fr)_minmax(100px,0.7fr)_minmax(100px,0.7fr)_200px] items-center gap-4 rounded-xl border border-border px-5 py-4 transition-smooth hover:bg-primary/5 sm:px-6"
                  >
                    <div className="min-w-0 text-center">
                      <div className="truncate font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground" title={buildComplexAddress(complex) || complex.name}>
                        {complex.name}
                      </div>
                    </div>
                    <div className="min-w-0 truncate text-xs text-muted-foreground self-center">{complex.city || '-'}</div>
                    <div className="min-w-0 truncate text-xs text-muted-foreground self-center">
                      {complex.country ? getCountryLabel(complex.country, language) : '-'}
                    </div>
                    <div className="flex justify-center gap-3 self-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/management/complexes/${complex.id}/edit`)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/management/complexes/${complex.id}/preferences`)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        {t('preferences')}
                      </button>
                    </div>
                  </div>
                ))}
                {complexes.length === 0 ? (
                  <div className="py-10 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="!mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{totalItems} {t('sportComplexes').toLowerCase()}</span>
          </div>
        </>
      )}
    </div>
  );
};


const buildComplexAddress = (complex: {
  street: string | null;
  address_number: string | null;
  address_complement: string | null;
  zip_code: string | null;
}, { includeComplement = true } = {}) => {
  const addressParts = [
    complex.street?.trim(),
    complex.address_number?.trim(),
    includeComplement ? complex.address_complement?.trim() : undefined,
  ].filter(Boolean);
  const mainAddress = addressParts.join(', ');
  return [mainAddress, complex.zip_code?.trim()].filter(Boolean).join(' · ');
};

export default SportComplexesManagement;
