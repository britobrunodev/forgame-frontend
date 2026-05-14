import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig, Receipt, Ticket, Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { paymentsApi, sportComplexApi, type PaymentData, type PaymentTransactionData } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from '@/session';

type PaymentKind = 'all' | 'championship' | 'court' | 'wellhub' | 'totalpass';
type PaymentStatusFilter = 'all' | 'paid' | 'pending' | 'failed';

const PAGE_SIZE = 20;

const ManagementPayments = () => {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { currentUser, isGestorMode, token } = useSession();
  const [openRows, setOpenRows] = useState<string[]>([]);

  const scopedType = (searchParams.get('type') as 'championship' | 'court' | null) ?? null;
  const scopedId = searchParams.get('id');

  const [selectedComplexId, setSelectedComplexId] = useState<'all' | string>('all');
  const [selectedKind, setSelectedKind] = useState<PaymentKind>(scopedType ?? 'all');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>('all');
  const [page, setPage] = useState(1);

  const canManage = isGestorMode || currentUser.isAdmin;

  const { data: complexesResponse } = useQuery({
    queryKey: ['management-payments-complexes', currentUser.isAdmin],
    queryFn: () => (
      currentUser.isAdmin
        ? sportComplexApi.listAll(token!, 1, 100)
        : sportComplexApi.list(token!, 1, 100)
    ),
    enabled: !!token && canManage,
  });

  const complexes = complexesResponse?.items ?? [];

  const { data: paymentsResponse, isLoading } = useQuery({
    queryKey: ['management-payments', page, selectedKind, selectedStatus, selectedComplexId, scopedId, scopedType],
    queryFn: () => paymentsApi.list(token!, {
      page,
      perPage: PAGE_SIZE,
      sourceType: selectedKind,
      sourceId: scopedType && selectedKind === scopedType ? (scopedId ?? undefined) : undefined,
      status: selectedStatus,
      complexId: selectedComplexId,
    }),
    enabled: !!token && canManage,
  });

  const visibleRows = paymentsResponse?.items ?? [];
  const totalPages = paymentsResponse?.total_pages ?? 1;
  const totalPaid = useMemo(() => visibleRows.reduce((sum, row) => sum + row.paid_amount, 0), [visibleRows]);
  const totalAmount = useMemo(() => visibleRows.reduce((sum, row) => sum + row.total_amount, 0), [visibleRows]);

  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))]">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('managementPayments')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header>
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('managementPayments')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementPaymentsIntro')}</p>
        </div>
      </header>

      <section className="space-y-5">
        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
            <Select value={selectedComplexId} onValueChange={(value) => { setSelectedComplexId(value as 'all' | string); setPage(1); }}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allComplexes')}</SelectItem>
                {complexes.map((complex) => (
                  <SelectItem key={complex.id} value={String(complex.id)}>
                    {complex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentType')}</div>
            <Select value={selectedKind} onValueChange={(value) => { setSelectedKind(value as PaymentKind); setPage(1); }}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allPayments')}</SelectItem>
                <SelectItem value="championship">{t('championships')}</SelectItem>
                <SelectItem value="court">{t('courtManagement')}</SelectItem>
                <SelectItem value="wellhub">{t('wellhub')}</SelectItem>
                <SelectItem value="totalpass">{t('totalpass')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentStatusSummary')}</div>
            <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value as PaymentStatusFilter); setPage(1); }}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allPaymentStatuses')}</SelectItem>
                <SelectItem value="paid">{t('paidStatus')}</SelectItem>
                <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
                <SelectItem value="failed">{t('failedStatus')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[860px]">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_36px_110px_90px_48px] gap-4 border-t border-b border-border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
              <div className="text-center">{t('fullName')}</div>
              <div className="text-center">{t('paymentSource')}</div>
              <div />
              <div className="text-center">{t('paymentStatusSummary')}</div>
              <div className="text-center">{t('paidAmount')}</div>
              <div />
            </div>

            <div className="mt-2 space-y-2">
              {visibleRows.map((row) => {
                const isOpen = openRows.includes(String(row.id));
                return (
                <div key={row.id} className="rounded-xl border border-border">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_36px_110px_90px_48px] items-center gap-4 px-5 py-3 sm:px-6">
                      <div className="text-center">
                        <div className="font-display text-sm font-bold">{row.user_name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{row.user_email}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{row.source_name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{formatDateValue(row.source_date, language)}</div>
                      </div>
                      <div className="flex justify-center"><TypeIcon type={row.source_type} /></div>
                      <div className="flex justify-center"><RowStatusBadge status={row.status} t={t} /></div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-foreground">{formatCurrency(row.paid_amount, language)}</div>
                        <div className="text-xs text-muted-foreground">/ {formatCurrency(row.total_amount, language)}</div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(String(row.id), setOpenRows)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow transition-smooth hover:bg-primary/16"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                    {isOpen ? <TransactionsPanel row={row} t={t} language={language} /> : null}
                  </div>
                );
              })}

              {!isLoading && visibleRows.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Receipt className="mx-auto h-10 w-10 text-muted-foreground/30" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {visibleRows.map((row) => {
            const isOpen = openRows.includes(String(row.id));
            return (
              <div key={row.id} className="overflow-hidden rounded-2xl border border-border bg-background/20">
                <button
                  type="button"
                  onClick={() => toggleRow(String(row.id), setOpenRows)}
                  className="w-full px-4 py-4 text-left transition-smooth hover:bg-secondary/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold">{row.user_name}</div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">{row.source_name}</div>
                    </div>
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-primary-glow transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <TypeIcon type={row.source_type} />
                    <RowStatusBadge status={row.status} t={t} />
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(row.paid_amount, language)}</span>
                    <span className="text-xs text-muted-foreground">/ {formatCurrency(row.total_amount, language)}</span>
                  </div>
                </button>
                {isOpen ? <TransactionsPanel row={row} t={t} language={language} /> : null}
              </div>
            );
          })}
          {!isLoading && visibleRows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background/20 px-4 py-10 text-center">
              <Receipt className="mx-auto h-10 w-10 text-muted-foreground/30" />
            </div>
          ) : null}
        </div>

        {!isLoading ? (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {paymentsResponse?.total ?? 0} {t('payments').toLowerCase()}
            </span>
          </div>
        ) : null}
      </section>
    </div>
  );
};

const TransactionsPanel = ({
  row,
  t,
  language,
}: {
  row: PaymentData;
  t: (key: string) => string;
  language: 'en' | 'pt-BR';
}) => (
  <div className="border-t border-border bg-background/12 px-4 pb-3 pt-2">
    <div className="space-y-1">
      {row.transactions.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} language={language} />
      ))}
    </div>
  </div>
);

const TransactionRow = ({
  transaction,
  language,
}: {
  transaction: PaymentTransactionData;
  language: 'en' | 'pt-BR';
}) => (
  <div className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-1.5">
    <div className="min-w-0 flex flex-1 items-center gap-2">
      <div className="shrink-0 text-xs font-semibold text-foreground">
        {formatTransactionMethod(transaction.method)}
      </div>
      <div className="min-w-0 truncate text-xs text-muted-foreground">
        {formatTransactionStatus(transaction.status)} · {formatTransactionDateTime(transaction, language)}
      </div>
    </div>
    <span className="shrink-0 text-xs font-semibold text-foreground">{formatCurrency(transaction.amount, language)}</span>
  </div>
);

const TypeIcon = ({ type }: { type: string }) => {
  const config: Record<string, { border: string; bg: string; color: string }> = {
    championship: { border: 'border-neon-cyan/20', bg: 'bg-neon-cyan/10', color: 'text-neon-cyan' },
    court: { border: 'border-neon-pink/20', bg: 'bg-neon-pink/10', color: 'text-neon-pink' },
    wellhub: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
    totalpass: { border: 'border-orange-500/20', bg: 'bg-orange-500/10', color: 'text-orange-500' },
  };
  const c = config[type] ?? config.championship;
  return (
    <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${c.border} ${c.bg} ${c.color}`}>
      {type === 'championship' ? <Trophy className="h-3.5 w-3.5" />
        : type === 'wellhub' ? <Receipt className="h-3.5 w-3.5" />
          : type === 'totalpass' ? <Ticket className="h-3.5 w-3.5" />
            : <Receipt className="h-3.5 w-3.5" />}
    </div>
  );
};

const RowStatusBadge = ({ status, t }: { status: string; t: (key: string) => string }) => (
  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${status === 'paid'
    ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
    : status === 'failed'
      ? 'border-live/20 bg-live/10 text-live'
      : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
    }`}>
    {status === 'paid' ? <CircleCheckBig className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
    {status === 'paid' ? t('paidStatus') : status === 'failed' ? t('failedStatus') : t('pendingStatus')}
  </div>
);

const toggleRow = (key: string, setOpenRows: Dispatch<SetStateAction<string[]>>) => {
  setOpenRows((current) => (
    current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]
  ));
};

const formatCurrency = (value: number, language: 'en' | 'pt-BR') =>
  new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatTransactionMethod = (method: string) => {
  const labels: Record<string, string> = {
    CREDIT_CARD: 'Cartão de Crédito',
    credit_card: 'Cartão de Crédito',
    DEBIT_CARD: 'Cartão de Débito',
    debit_card: 'Cartão de Débito',
    PIX: 'PIX',
    pix: 'PIX',
    PAY_ON_SITE: 'No Local',
    pay_on_site: 'No Local',
    BOLETO: 'Boleto',
    boleto: 'Boleto',
  };
  return labels[method] ?? method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTransactionStatus = (status: string) => {
  const labels: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    received: 'Received',
    confirmed: 'Confirmed',
  };
  return labels[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTransactionDateTime = (
  transaction: PaymentTransactionData,
  language: 'en' | 'pt-BR',
) => {
  const legacyPaidAt = (transaction as PaymentTransactionData & { paidAt?: string }).paidAt;
  const rawValue = legacyPaidAt ?? transaction.created_at;
  if (!rawValue) return '—';

  const parsed = new Date(rawValue.includes('T') ? rawValue : rawValue.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return rawValue;

  return parsed.toLocaleString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateValue = (dateValue: string | null, language: 'en' | 'pt-BR') => {
  if (!dateValue) return '—';
  return new Date(`${dateValue}T12:00:00`).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default ManagementPayments;
