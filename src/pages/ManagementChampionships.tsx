import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Receipt, Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { championshipApi } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  open: 'Inscrições abertas',
  subscription_ended: 'Inscrições encerradas',
  live: 'Ao vivo',
  ended: 'Finalizado',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted/60 text-muted-foreground',
  open: 'bg-primary/10 text-primary-glow',
  subscription_ended: 'bg-neon-pink/10 text-neon-pink',
  live: 'bg-live/10 text-live',
  ended: 'bg-muted/40 text-muted-foreground',
};

const ManagementChampionships = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser, isGestorMode, token } = useSession();
  const [page, setPage] = useState(1);
  const perPage = 12;
  const canManage = currentUser.isAdmin || isGestorMode;

  const { data, isLoading } = useQuery({
    queryKey: ['championships', page],
    queryFn: () => championshipApi.listMine(token!, page, perPage),
    enabled: !!token && canManage,
  });

  const championships = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalItems = data?.total ?? 0;

  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))]">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('championships')}</span>
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
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('championships')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementChampionshipsIntro')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/management/championships/new')}
          title={t('createChampionship')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : championships.length > 0 ? (
        <div className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {championships.map((c) => (
              <article key={c.id} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className="font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground">{c.name}</div>
                <div className="mt-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${STATUS_COLORS[c.status] ?? STATUS_COLORS.draft}`}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>
                {(c.start_at || c.end_at) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-muted-foreground/60 uppercase tracking-[0.1em] text-[9px]">{t('eventDate')}: </span>
                    {formatDateRange(c.start_at, c.end_at)}
                  </div>
                )}
                {c.registration_deadline_at && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-muted-foreground/60 uppercase tracking-[0.1em] text-[9px]">{t('registrationDeadline')}: </span>
                    {fmtDate(c.registration_deadline_at)}
                  </div>
                )}
                <div className="mt-4 flex gap-2 border-t border-border/50 pt-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/management/championships/${c.id}/edit`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/management/payments?type=championship&id=${c.id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <Receipt className="h-4 w-4" />
                    {t('payments')}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[minmax(0,2fr)_180px_minmax(0,1.6fr)_200px] gap-4 border-b border-border bg-background/30 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
                <div>{t('tournamentName')}</div>
                <div>Status</div>
                <div>{t('eventDate')} / {t('registrationDeadline')}</div>
                <div className="text-right">{t('settings')}</div>
              </div>
              {championships.map((c, index) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[minmax(0,2fr)_180px_minmax(0,1.6fr)_200px] gap-4 px-5 py-4 transition-smooth hover:bg-primary/5 sm:px-6 ${index !== championships.length - 1 ? 'border-b border-border/70' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">{c.name}</div>
                  </div>
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${STATUS_COLORS[c.status] ?? STATUS_COLORS.draft}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="truncate text-sm text-muted-foreground">{formatDateRange(c.start_at, c.end_at)}</span>
                    {c.registration_deadline_at && (
                      <span className="truncate text-[11px] text-muted-foreground/60">
                        <span className="font-semibold uppercase tracking-[0.08em]">{t('registrationDeadline')}: </span>
                        {fmtDate(c.registration_deadline_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/management/championships/${c.id}/edit`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/management/payments?type=championship&id=${c.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                    >
                      <Receipt className="h-4 w-4" />
                      {t('payments')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
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
            <span className="text-xs text-muted-foreground">{totalItems} {t('championships').toLowerCase()}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <Trophy className="mb-4 h-8 w-8 text-muted-foreground/50" />
          <h2 className="font-display text-2xl font-black">{t('noManagedChampionshipsTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noManagedChampionshipsDescription')}</p>
        </div>
      )}
    </div>
  );
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatDateRange = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start && !end) return '-';
  if (!end) return start ? fmtDate(start) : '-';
  const s = fmtDate(start!);
  const e = fmtDate(end);
  return s === e ? s : `${s} – ${e}`;
};

export default ManagementChampionships;
