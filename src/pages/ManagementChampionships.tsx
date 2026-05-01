import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ChevronDown, CircleAlert, CircleCheckBig, Plus, Receipt, Trophy } from 'lucide-react';
import { MANAGED_CHAMPIONSHIPS, RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import type { ManagedChampionship, PaymentMethod } from '@/types';

const statusOrder: Record<ManagedChampionship['status'], number> = {
  upcoming: 0,
  live: 1,
  finished: 2,
};

const ManagementChampionships = () => {
  const navigate = useNavigate();
  const { t, language, sportName } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const [openPayments, setOpenPayments] = useState<string[]>([]);
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

                  <button
                    type="button"
                    onClick={() => navigate(`/management/payments?type=championship&id=${championship.id}`)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <Receipt className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background/20">
                  <div className="border-b border-border px-4 py-3">
                    <div className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('paymentsByUser')}</div>
                  </div>

                  <div className="hidden grid-cols-[minmax(0,1.6fr)_140px_120px_56px] gap-4 border-b border-border bg-background/25 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:grid">
                    <div>{t('fullName')}</div>
                    <div>{t('paymentStatusSummary')}</div>
                    <div>{t('paidAmount')}</div>
                    <div />
                  </div>

                  <div className="divide-y divide-border">
                    {championship.payments.map((payment) => {
                      const paymentKey = `${championship.id}:${payment.userId}`;
                      const isOpen = openPayments.includes(paymentKey);

                      return (
                        <div key={payment.userId}>
                          <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.6fr)_140px_120px_56px] md:items-center">
                            <div>
                              <div className="font-display text-sm font-bold sm:text-[15px]">{payment.userName}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{payment.userEmail}</div>
                            </div>

                            <div className="space-y-2 md:space-y-0">
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:hidden">{t('paymentStatusSummary')}</div>
                              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                payment.status === 'paid'
                                  ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
                                  : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
                              }`}>
                                {payment.status === 'paid' ? <CircleCheckBig className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                                {payment.status === 'paid' ? t('paidStatus') : t('pendingStatus')}
                              </div>
                            </div>

                            <div className="space-y-2 md:space-y-0">
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:hidden">{t('paidAmount')}</div>
                              <div className="font-semibold text-foreground">{formatCurrency(payment.paidAmount, language)}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(payment.totalAmount, language)} · {payment.transactions.length} {t('paymentAttemptsLabel')}</div>
                            </div>

                            <div className="flex justify-start md:justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenPayments((current) => (
                                    current.includes(paymentKey)
                                      ? current.filter((item) => item !== paymentKey)
                                      : [...current, paymentKey]
                                  ));
                                }}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow transition-smooth hover:bg-primary/16"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {isOpen ? (
                            <div className="border-t border-border bg-background/15 px-4 pb-4 pt-4">
                              <div className="space-y-2">
                                {payment.transactions.map((transaction, index) => (
                                  <div key={transaction.id} className="rounded-xl border border-border bg-background/25 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <div className="font-semibold text-foreground">{t('paymentAttempt')} {index + 1}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {transaction.reference} · {paymentMethodLabel(t, transaction.method)} · {transaction.paidAt}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-foreground">{formatCurrency(transaction.amount, language)}</div>
                                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                          transaction.status === 'paid'
                                            ? 'text-neon-cyan'
                                            : transaction.status === 'failed'
                                              ? 'text-live'
                                              : 'text-neon-pink'
                                        }`}>
                                          {transaction.status === 'paid'
                                            ? <CircleCheckBig className="h-3.5 w-3.5" />
                                            : transaction.status === 'failed'
                                              ? <CircleAlert className="h-3.5 w-3.5" />
                                              : <Receipt className="h-3.5 w-3.5" />}
                                          {transaction.status === 'paid' ? t('paidStatus') : transaction.status === 'failed' ? t('failedStatus') : t('pendingStatus')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
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

const formatCurrency = (value: number, language: 'en' | 'pt-BR') =>
  new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

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

const paymentMethodLabel = (t: (key: string) => string, method: PaymentMethod) => ({
  pix: t('pix'),
  'credit-card': t('creditCard'),
  'debit-card': t('debitCard'),
  'pay-on-site': t('payOnSite'),
}[method]);

export default ManagementChampionships;
