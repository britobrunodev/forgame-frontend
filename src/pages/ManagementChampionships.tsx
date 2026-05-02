import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, Pencil, Plus, Receipt, Trophy } from 'lucide-react';
import { MANAGED_CHAMPIONSHIPS, RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import type { ManagedChampionship } from '@/types';

const statusOrder: Record<ManagedChampionship['status'], number> = {
  upcoming: 0,
  live: 1,
  finished: 2,
};

const ManagementChampionships = () => {
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];
  const visibleChampionships = useMemo(
    () => MANAGED_CHAMPIONSHIPS
      .filter((championship) => ownedComplexIds.includes(championship.complexId))
      .sort((left, right) => {
        const statusDifference = statusOrder[left.status] - statusOrder[right.status];
        if (statusDifference !== 0) return statusDifference;
        return left.startDate.localeCompare(right.startDate);
      }),
    [ownedComplexIds],
  );

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
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
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('championships')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementChampionshipsIntro')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {visibleChampionships.length > 0 ? (
        <div className="space-y-5">
          {visibleChampionships.map((championship) => {
            const complex = RESERVATION_PLACES.find((place) => place.id === championship.complexId);
            return (
              <article key={championship.id} className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{sportName(championship.sport)}</p>
                    <h2 className="font-display text-2xl font-black leading-tight">{championship.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-neon-pink" />
                        {complex?.name ?? '-'}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neon-cyan" />
                        {formatDateRange(championship.startDate, championship.endDate, language)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-neon-cyan" />
                        {championship.teamsCount} {t('teams')}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-neon-pink" />
                        {championship.status === 'live' ? t('live') : championship.status === 'finished' ? t('finished') : t('upcoming')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/management/championships/${championship.id}/edit`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/management/payments?type=championship&id=${championship.id}`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                    >
                      <Receipt className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-black">{t('noManagedChampionshipsTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noManagedChampionshipsDescription')}</p>
        </div>
      )}
    </div>
  );
};

const formatDateRange = (startDate: string, endDate: string, language: 'en' | 'pt-BR') => {
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
  const start = new Date(`${startDate}T12:00:00`).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const end = new Date(`${endDate}T12:00:00`).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${start} - ${end}`;
};

export default ManagementChampionships;
