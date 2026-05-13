import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ClipboardList, Loader2, Pencil, Receipt, ShieldCheck, Trophy } from 'lucide-react';
import { championshipSubscriptionsApi } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const PAGE_SIZE = 12;

const Bookings = () => {
  const { t, language } = useLanguage();
  const { token } = useSession();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-championship-subscriptions', page],
    queryFn: () => championshipSubscriptionsApi.listMine(token!, page, PAGE_SIZE),
    enabled: !!token,
  });

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalItems = data?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
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
                const effectiveStatus = subscription.payment_status === 'paid' || subscription.payment_status === 'confirmed' ? 'paid' : subscription.status;
                const canPay = effectiveStatus !== 'paid' && effectiveStatus !== 'draft' && !!subscription.payment_id;
                const teamCount = subscription.team_user_ids?.length ?? subscription.players_per_team ?? 0;

                const canEdit = effectiveStatus === 'draft';
                const canReceipt = effectiveStatus === 'paid' && !!subscription.payment_id;
                return (
                  <div key={subscription.id} className="rounded-2xl border border-border bg-background/25 p-4 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-bold">{subscription.championship_name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{subscription.complex_name ?? '—'}</div>
                      </div>
                      <StatusBadge status={effectiveStatus} t={t} />
                    </div>
                    <div className="mt-3 grid gap-3">
                      <MobileInfoRow label={t('subscriptionCategory')} value={categoryLabel} />
                      <MobileInfoRow label={t('subscriptionTeam')} value={`${teamCount} ${t('playersLabel')}`} />
                      <MobileInfoRow
                        label={t('paymentStatusSummary')}
                        value={subscription.status === 'paid' ? t('paidStatus') : subscription.status === 'draft' ? 'Rascunho' : t('pendingStatus')}
                      />
                    </div>
                    {(canEdit || canPay || canReceipt) ? (
                      <div className="mt-4 flex gap-2 border-t border-border/50 pt-3">
                        {canEdit && (
                          <EditButton onClick={() => navigateToEdit(navigate, subscription)} />
                        )}
                        {canPay && (
                          <PayButton onClick={() => navigateToPayment(navigate, t, subscription, language)} />
                        )}
                        {canReceipt && (
                          <ReceiptButton onClick={() => navigate(`/payment/${subscription.payment_id}/success`)} />
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {items.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background/25 px-4 py-10 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30" />
                </div>
              ) : null}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                  <col className="w-[21%]" />
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
                    const effectiveStatus = subscription.payment_status === 'paid' || subscription.payment_status === 'confirmed' ? 'paid' : subscription.status;
                    const canPay = effectiveStatus !== 'paid' && effectiveStatus !== 'draft' && !!subscription.payment_id;
                    const teamCount = subscription.team_user_ids?.length ?? subscription.players_per_team ?? 0;

                    const canEdit = effectiveStatus === 'draft';
                    const canReceipt = effectiveStatus === 'paid' && !!subscription.payment_id;
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
                          <StatusBadge status={effectiveStatus} t={t} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            {canEdit && (
                              <EditButton onClick={() => navigateToEdit(navigate, subscription)} />
                            )}
                            {canPay && (
                              <PayButton onClick={() => navigateToPayment(navigate, t, subscription, language)} />
                            )}
                            {canReceipt && (
                              <ReceiptButton onClick={() => navigate(`/payment/${subscription.payment_id}/success`)} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30" />
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

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
  >
    <Pencil className="h-4 w-4" />
    EDITAR
  </button>
);

const PayButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-glow transition-smooth hover:border-primary/40 hover:bg-primary/15"
  >
    <Receipt className="h-4 w-4" />
    PAGAR
  </button>
);

const ReceiptButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
  >
    <ShieldCheck className="h-4 w-4" />
    COMPROVANTE
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
  <div className={`flex w-full items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
    muted
      ? 'border-border bg-background/40 text-muted-foreground'
      : status === 'paid'
        ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
        : status === 'draft'
          ? 'border-border bg-background/40 text-muted-foreground'
          : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
  }`}>
    <Trophy className="h-3 w-3" />
    {muted ? '—' : status === 'paid' ? t('confirmedSubscriptionStatus') : status === 'draft' ? 'Rascunho' : t('pendingStatus')}
  </div>
);

const navigateToEdit = (
  navigate: ReturnType<typeof useNavigate>,
  subscription: { championship_id: number; id: number; category_id: number; team_user_ids: number[] },
) => {
  navigate(`/championships/${subscription.championship_id}/register`, {
    state: {
      editSubscription: {
        subscriptionId: subscription.id,
        categoryId: subscription.category_id,
        playerIds: subscription.team_user_ids,
      },
    },
  });
};

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
      sourceType: 'championship',
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
