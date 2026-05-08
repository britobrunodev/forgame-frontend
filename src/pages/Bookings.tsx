import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, MapPin, Receipt, Trophy } from 'lucide-react';
import { championshipSubscriptionsApi } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const PAGE_SIZE = 12;

const Bookings = () => {
  const { t, language } = useLanguage();
  const { token } = useSession();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const reservationsPage = 1;
  const reservationsTotalPages = 1;
  const reservationsTotalItems = 0;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-championship-subscriptions', page],
    queryFn: () => championshipSubscriptionsApi.listMine(token!, page, PAGE_SIZE),
    enabled: !!token,
  });

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalItems = data?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('scheduleTitle')}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('scheduleDescription')}</p>
      </header>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        <SectionTitle icon={<Trophy className="h-4 w-4 text-neon-cyan" />} title={t('championshipRegistrations')} />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-live/20 bg-live/10 p-6 text-sm text-live">
            {error instanceof Error ? error.message : 'Erro ao carregar suas inscrições.'}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((subscription) => {
                const categoryLabel = `${t(subscription.category_slug ?? '')}${subscription.audience_slug ? ` · ${t(subscription.audience_slug)}` : ''}`;
                const canPay = subscription.status !== 'paid' && !!subscription.payment_id;
                const teamCount = subscription.team_user_ids?.length ?? subscription.players_per_team ?? 0;

                return (
                  <div key={subscription.id} className="rounded-2xl border border-border bg-background/25 p-4 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-bold">{subscription.championship_name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{subscription.complex_name ?? '—'}</div>
                      </div>
                      <StatusBadge status={subscription.status} t={t} />
                    </div>
                    <div className="mt-3 grid gap-3">
                      <MobileInfoRow label={t('subscriptionCategory')} value={categoryLabel} />
                      <MobileInfoRow label={t('subscriptionTeam')} value={`${teamCount} ${t('playersLabel')}`} />
                      <MobileInfoRow
                        label={t('paymentStatusSummary')}
                        value={subscription.status === 'paid' ? t('paidStatus') : t('pendingStatus')}
                      />
                    </div>
                    {canPay ? (
                      <div className="mt-4">
                        <PayButton
                          label={t('continuePayment')}
                          onClick={() => navigateToPayment(navigate, t, subscription, language)}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {items.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background/25 px-4 py-8 text-sm text-muted-foreground">
                  {t('scheduleEmpty')}
                </div>
              ) : null}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-background/30 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-5 py-3">{t('championships')}</th>
                    <th className="px-5 py-3">{t('subscriptionCategory')}</th>
                    <th className="px-5 py-3">{t('subscriptionTeam')}</th>
                    <th className="px-5 py-3">{t('paymentStatusSummary')}</th>
                    <th className="px-5 py-3">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((subscription) => {
                    const categoryLabel = `${t(subscription.category_slug ?? '')}${subscription.audience_slug ? ` · ${t(subscription.audience_slug)}` : ''}`;
                    const canPay = subscription.status !== 'paid' && !!subscription.payment_id;
                    const teamCount = subscription.team_user_ids?.length ?? subscription.players_per_team ?? 0;

                    return (
                      <tr key={subscription.id} className="transition-smooth hover:bg-primary/5">
                        <td className="px-5 py-4">
                          <div className="truncate font-semibold text-foreground">{subscription.championship_name}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">{subscription.complex_name ?? '—'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="block text-sm text-foreground">{categoryLabel}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="block text-sm text-foreground">{teamCount} {t('playersLabel')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={subscription.status} t={t} />
                        </td>
                        <td className="px-5 py-4">
                          {canPay ? (
                            <PayButton
                              label={t('continuePayment')}
                              onClick={() => navigateToPayment(navigate, t, subscription, language)}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-sm text-muted-foreground">
                        {t('scheduleEmpty')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <PaginationFooter
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              label={t('championshipRegistrations')}
              onPrevious={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          </>
        )}
      </section>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        <SectionTitle icon={<MapPin className="h-4 w-4 text-neon-pink" />} title={t('reservations')} />

        <div className="space-y-3 md:hidden">
          <div className="rounded-2xl border border-border bg-background/25 p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-bold">—</div>
                <div className="mt-1 text-xs text-muted-foreground">{t('noReservations')}</div>
              </div>
              <StatusBadge status="pending" t={t} muted />
            </div>
            <div className="mt-3 grid gap-3">
              <MobileInfoRow label={t('sportComplex')} value="—" />
              <MobileInfoRow label={t('reservationFlow')} value={t('noReservations')} />
              <MobileInfoRow label={t('paymentStatusSummary')} value="—" />
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[38%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-background/30 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <th className="px-5 py-3">{t('reservations')}</th>
                <th className="px-5 py-3">{t('reservationFlow')}</th>
                <th className="px-5 py-3">{t('paymentStatusSummary')}</th>
                <th className="px-5 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-4">
                  <div className="truncate font-semibold text-foreground">—</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{t('sportComplex')}</div>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {t('noReservations')}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status="pending" t={t} muted />
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-muted-foreground">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationFooter
          page={reservationsPage}
          totalPages={reservationsTotalPages}
          totalItems={reservationsTotalItems}
          label={t('reservations')}
          onPrevious={() => undefined}
          onNext={() => undefined}
        />
      </section>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="mb-5 flex items-center gap-2">
    {icon}
    <h2 className="font-display text-lg font-bold">{title}</h2>
  </div>
);

const MobileInfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/30 p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold text-foreground">{value}</div>
  </div>
);

const PaginationFooter = ({
  page,
  totalPages,
  totalItems,
  label,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) => (
  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center justify-center gap-2 sm:justify-start">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page <= 1}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
    <div className="text-center text-xs text-muted-foreground sm:text-right">
      {totalItems} {label.toLowerCase()}
    </div>
  </div>
);

const PayButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary-glow transition-smooth hover:border-primary/40 hover:bg-primary/15"
  >
    <Receipt className="h-4 w-4" />
    {label}
  </button>
);

const StatusBadge = ({
  status,
  t,
  muted = false,
}: {
  status: string;
  t: (key: string) => string;
  muted?: boolean;
}) => (
  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
    muted
      ? 'border-border bg-background/40 text-muted-foreground'
      :
    status === 'paid'
      ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
      : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
  }`}>
    <Trophy className="h-3 w-3" />
    {muted ? '—' : status === 'paid' ? t('paidStatus') : t('pendingStatus')}
  </div>
);

const navigateToPayment = (
  navigate: ReturnType<typeof useNavigate>,
  t: (key: string) => string,
  subscription: {
    payment_id: number | null;
    championship_name: string;
    complex_id: number | null;
    category_slug: string;
    audience_slug: string;
    team_user_ids: number[];
    players_per_team: number;
    payment_total_amount: number | null;
    amount: number | null;
  },
  language: 'en' | 'pt-BR',
) => {
  if (!subscription.payment_id) return;

  const categoryLabel = `${t(subscription.category_slug ?? '')}${subscription.audience_slug ? ` · ${t(subscription.audience_slug)}` : ''}`;
  const teamCount = subscription.team_user_ids?.length ?? subscription.players_per_team ?? 0;
  const formattedAmount = formatCurrency(subscription.payment_total_amount ?? subscription.amount ?? 0, language);

  navigate(`/payment/${subscription.payment_id}`, {
    state: {
      paymentId: subscription.payment_id,
      title: t('paymentTitle'),
      description: `${t('registrationFor')} ${subscription.championship_name}`,
      amount: formattedAmount,
      backTo: '/bookings',
      complexId: subscription.complex_id != null ? String(subscription.complex_id) : undefined,
      summary: [
        { label: t('championships'), value: subscription.championship_name },
        { label: t('subscriptionCategory'), value: categoryLabel },
        { label: t('subscriptionTeam'), value: `${teamCount} ${t('playersLabel')}` },
        { label: t('paymentStatusSummary'), value: t('pendingStatus') },
      ],
    },
  });
};

const formatCurrency = (value: number, language: 'en' | 'pt-BR') =>
  new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export default Bookings;
