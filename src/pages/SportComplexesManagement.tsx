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
    queryKey: ['sport-complexes', page],
    queryFn: () => sportComplexApi.list(token!, page, perPage),
    enabled: !!token && canManageComplexes,
  });
  const complexes = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  if (!canManageComplexes) {
    return (
      <div className="mx-auto w-full max-w-3xl">
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
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('sportComplexes')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('sportComplexesIntro')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/management/complexs/new')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : complexes.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3 md:hidden">
            {complexes.map((complex) => (
              <article key={complex.id} className="rounded-2xl border border-border bg-gradient-card p-4 shadow-card">
                <div className="space-y-2">
                  <div className="font-display text-base font-bold text-foreground">{complex.name}</div>
                  <div className="text-sm text-muted-foreground">{complex.city || '-'}</div>
                  <div className="text-sm text-muted-foreground">
                    {complex.country ? getCountryLabel(complex.country, language) : '-'}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/management/complexs/${complex.id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/management/complexs/${complex.id}/preferences`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('preferences')}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-[2rem] border border-border bg-gradient-card shadow-card md:block">
            <div className="overflow-x-auto">
              <div className="min-w-[840px]">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_120px_260px] gap-4 border-b border-border px-5 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
                <div>{t('complexName')}</div>
                <div>{t('city')}</div>
                <div>{t('country')}</div>
                <div className="text-right">{t('settings')}</div>
              </div>
              {complexes.map((complex, index) => (
                <div
                  key={complex.id}
                  className={`grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_120px_260px] gap-4 px-5 py-4 sm:px-6 ${index !== complexes.length - 1 ? 'border-b border-border/70' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-bold text-foreground">{complex.name}</div>
                  </div>
                  <div className="min-w-0 truncate text-sm text-muted-foreground">{complex.city || '-'}</div>
                  <div className="min-w-0 truncate text-sm text-muted-foreground">
                    {complex.country ? getCountryLabel(complex.country, language) : '-'}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/management/complexs/${complex.id}/edit`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/management/complexs/${complex.id}/preferences`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {t('preferences')}
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <Building2 className="mb-4 h-8 w-8 text-muted-foreground/50" />
          <h2 className="font-display text-2xl font-black">{t('noSportComplexesTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noSportComplexesDescription')}</p>
        </div>
      )}
    </div>
  );
};

const PaginationBar = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SportComplexesManagement;
