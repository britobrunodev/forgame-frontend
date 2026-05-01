import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, CircleAlert, CircleCheckBig, Receipt, Trophy } from 'lucide-react';
import { MANAGED_CHAMPIONSHIPS, MANAGED_COURT_PAYMENTS, RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { getManagedSportComplexes } from '@/lib/sport-complexes-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentMethod, PaymentTransaction } from '@/types';

type PaymentKind = 'all' | 'championship' | 'court';
type PaymentStatusFilter = 'all' | 'paid' | 'pending' | 'failed';

type PaymentRow = {
  key: string;
  complexId: string;
  sourceId: string;
  userName: string;
  userEmail: string;
  sourceName: string;
  sourceType: 'championship' | 'court';
  sourceDate: string;
  status: 'paid' | 'pending';
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  transactions: PaymentTransaction[];
};

const ManagementPayments = () => {
  const [searchParams] = useSearchParams();
  const { t, language, sportName } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];
  const [openRows, setOpenRows] = useState<string[]>([]);

  const scopedType = (searchParams.get('type') as 'championship' | 'court' | null) ?? null;
  const scopedId = searchParams.get('id');

  const allComplexes = useMemo(
    () => getManagedSportComplexes(ownedComplexIds),
    [ownedComplexIds],
  );

  const scopedComplexId = useMemo(() => {
    if (scopedType === 'championship') {
      return MANAGED_CHAMPIONSHIPS.find((championship) => championship.id === scopedId)?.complexId ?? 'all';
    }
    if (scopedType === 'court') {
      return MANAGED_COURT_PAYMENTS.find((payment) => payment.courtId === scopedId)?.complexId ?? 'all';
    }
    return 'all';
  }, [scopedId, scopedType]);

  const [selectedComplexId, setSelectedComplexId] = useState<'all' | string>(scopedComplexId);
  const [selectedKind, setSelectedKind] = useState<PaymentKind>(scopedType ?? 'all');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>('all');
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<'all' | string>(
    scopedType === 'championship' && scopedId ? scopedId : 'all',
  );

  const availableChampionships = useMemo(
    () => MANAGED_CHAMPIONSHIPS
      .filter((championship) => ownedComplexIds.includes(championship.complexId))
      .filter((championship) => selectedComplexId === 'all' || championship.complexId === selectedComplexId)
      .filter((championship) => scopedType !== 'championship' || championship.id === scopedId),
    [ownedComplexIds, scopedId, scopedType, selectedComplexId],
  );

  useEffect(() => {
    setSelectedComplexId(scopedComplexId);
    setSelectedKind(scopedType ?? 'all');
    setSelectedChampionshipId(scopedType === 'championship' && scopedId ? scopedId : 'all');
  }, [scopedComplexId, scopedType]);

  useEffect(() => {
    if (selectedChampionshipId === 'all') return;
    if (availableChampionships.some((championship) => championship.id === selectedChampionshipId)) return;
    setSelectedChampionshipId('all');
  }, [availableChampionships, selectedChampionshipId]);

  const paymentRows = useMemo<PaymentRow[]>(() => {
    const championshipRows = MANAGED_CHAMPIONSHIPS
      .filter((championship) => ownedComplexIds.includes(championship.complexId))
      .filter((championship) => scopedType !== 'championship' || championship.id === scopedId)
      .flatMap((championship) => (
        championship.payments.map((payment) => ({
          key: `championship:${championship.id}:${payment.userId}`,
          complexId: championship.complexId,
          sourceId: championship.id,
          userName: payment.userName,
          userEmail: payment.userEmail,
          sourceName: championship.name,
          sourceType: 'championship' as const,
          sourceDate: `${formatDateRange(championship.startDate, championship.endDate, language)} · ${sportName(championship.sport)}`,
          status: payment.status,
          paidAmount: payment.paidAmount,
          totalAmount: payment.totalAmount,
          remainingAmount: payment.remainingAmount,
          transactions: payment.transactions,
        }))
      ));

    const courtRows = MANAGED_COURT_PAYMENTS
      .filter((payment) => ownedComplexIds.includes(payment.complexId))
      .filter((payment) => scopedType !== 'court' || payment.courtId === scopedId)
      .map((payment) => ({
        key: `court:${payment.id}`,
        complexId: payment.complexId,
        sourceId: payment.courtId,
        userName: payment.userName,
        userEmail: payment.userEmail,
        sourceName: payment.courtName,
        sourceType: 'court' as const,
        sourceDate: `${formatDateValue(payment.reservationDate, language)} · ${payment.timeSlot}`,
        status: payment.status,
        paidAmount: payment.paidAmount,
        totalAmount: payment.totalAmount,
        remainingAmount: payment.remainingAmount,
        transactions: payment.transactions,
      }));

    return [...championshipRows, ...courtRows].sort((left, right) => {
      if (left.sourceType !== right.sourceType) {
        return left.sourceType === 'championship' ? -1 : 1;
      }
      return right.sourceDate.localeCompare(left.sourceDate);
    });
  }, [language, ownedComplexIds, scopedId, scopedType, sportName]);

  const visibleRows = paymentRows.filter((row) => {
    if (selectedComplexId !== 'all' && row.complexId !== selectedComplexId) return false;
    if (selectedKind !== 'all' && row.sourceType !== selectedKind) return false;
    if (selectedChampionshipId !== 'all' && (row.sourceType !== 'championship' || row.sourceId !== selectedChampionshipId)) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'failed') {
        return row.transactions.some((transaction) => transaction.status === 'failed');
      }
      return row.status === selectedStatus;
    }
    return true;
  });

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
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
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('managementPayments')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementPaymentsIntro')}</p>
        </div>
      </header>

      <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)_160px]">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
            <Select value={selectedComplexId} onValueChange={(value) => setSelectedComplexId(value as 'all' | string)}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allComplexes')}</SelectItem>
                {allComplexes.map((complex) => (
                  <SelectItem key={complex.id} value={complex.id}>
                    {complex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentType')}</div>
            <Select value={selectedKind} onValueChange={(value) => setSelectedKind(value as PaymentKind)}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allPayments')}</SelectItem>
                <SelectItem value="court">{t('courtManagement')}</SelectItem>
                <SelectItem value="championship">{t('championships')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('championships')}</div>
            <Select
              value={selectedChampionshipId}
              onValueChange={(value) => {
                setSelectedChampionshipId(value as 'all' | string);
                if (value !== 'all') setSelectedKind('championship');
              }}
            >
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allChampionships')}</SelectItem>
                {availableChampionships.map((championship) => (
                  <SelectItem key={championship.id} value={championship.id}>
                    {championship.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentStatusSummary')}</div>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PaymentStatusFilter)}>
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

        <div className="hidden overflow-hidden rounded-2xl border border-border bg-background/20 md:block">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_36px_110px_90px_48px] gap-4 border-b border-border bg-background/25 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <div>{t('fullName')}</div>
            <div>{t('paymentSource')}</div>
            <div />
            <div>{t('paymentStatusSummary')}</div>
            <div>{t('paidAmount')}</div>
            <div />
          </div>

          <div className="divide-y divide-border">
            {visibleRows.map((row) => {
              const isOpen = openRows.includes(row.key);

              return (
                <div key={row.key}>
                  <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_36px_110px_90px_48px] items-center gap-4 px-4 py-3">
                    <div>
                      <div className="font-display text-sm font-bold">{row.userName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{row.userEmail}</div>
                    </div>

                    <div>
                      <div className="font-semibold text-foreground">{row.sourceName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{row.sourceDate}</div>
                    </div>

                    <div>
                      <TypeIcon type={row.sourceType} />
                    </div>

                    <div>
                      <RowStatusBadge status={row.status} t={t} />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-foreground">{formatCurrency(row.paidAmount, language)}</div>
                      <div className="text-xs text-muted-foreground">/ {formatCurrency(row.totalAmount, language)}</div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.key, setOpenRows)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow transition-smooth hover:bg-primary/16"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <TransactionsPanel row={row} t={t} language={language} />
                  ) : null}
                </div>
              );
            })}

            {visibleRows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">{t('noPaymentsDescription')}</div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {visibleRows.map((row) => {
            const isOpen = openRows.includes(row.key);

            return (
              <div key={row.key} className="overflow-hidden rounded-2xl border border-border bg-background/20">
                <button
                  type="button"
                  onClick={() => toggleRow(row.key, setOpenRows)}
                  className="w-full px-4 py-4 text-left transition-smooth hover:bg-secondary/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold">{row.userName}</div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">{row.sourceName}</div>
                    </div>
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-primary-glow transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <TypeIcon type={row.sourceType} />
                    <RowStatusBadge status={row.status} t={t} />
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(row.paidAmount, language)}</span>
                    <span className="text-xs text-muted-foreground">/ {formatCurrency(row.totalAmount, language)}</span>
                  </div>
                </button>

                {isOpen ? (
                  <TransactionsPanel row={row} t={t} language={language} />
                ) : null}
              </div>
            );
          })}

          {visibleRows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background/20 px-4 py-6 text-sm text-muted-foreground">
              {t('noPaymentsDescription')}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

const TransactionsPanel = ({
  row,
  t,
  language,
}: {
  row: PaymentRow;
  t: (key: string) => string;
  language: 'en' | 'pt-BR';
}) => (
  <div className="border-t border-border bg-background/12 px-4 pb-3 pt-2">
    <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
      {row.transactions.length} {t('paymentAttemptsLabel')}
    </div>
    <div className="space-y-1">
      {row.transactions.map((transaction, index) => (
        <div key={transaction.id} className="flex items-center gap-3 rounded-md border border-border/60 bg-background/20 px-3 py-1.5">
          <span className="shrink-0 text-xs font-semibold text-foreground">{t('paymentAttempt')} {index + 1}</span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {transaction.reference} · {paymentMethodLabel(t, transaction.method)} · {transaction.paidAt}
          </span>
          <span className="shrink-0 text-xs font-semibold text-foreground">{formatCurrency(transaction.amount, language)}</span>
          <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold ${
            transaction.status === 'paid' ? 'text-neon-cyan' : transaction.status === 'failed' ? 'text-live' : 'text-neon-pink'
          }`}>
            {transaction.status === 'paid'
              ? <CircleCheckBig className="h-3 w-3" />
              : transaction.status === 'failed'
                ? <CircleAlert className="h-3 w-3" />
                : <Receipt className="h-3 w-3" />}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const TypeIcon = ({ type }: { type: 'championship' | 'court' }) => (
  <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
    type === 'championship'
      ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
      : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
  }`}>
    {type === 'championship' ? <Trophy className="h-3.5 w-3.5" /> : <Receipt className="h-3.5 w-3.5" />}
  </div>
);

const RowStatusBadge = ({ status, t }: { status: 'paid' | 'pending'; t: (key: string) => string }) => (
  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
    status === 'paid'
      ? 'border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan'
      : 'border-neon-pink/20 bg-neon-pink/10 text-neon-pink'
  }`}>
    {status === 'paid' ? <CircleCheckBig className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
    {status === 'paid' ? t('paidStatus') : t('pendingStatus')}
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

const formatDateValue = (dateValue: string, language: 'en' | 'pt-BR') =>
  new Date(`${dateValue}T12:00:00`).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatDateRange = (startDate: string, endDate: string, language: 'en' | 'pt-BR') => {
  const start = formatDateValue(startDate, language);
  const end = formatDateValue(endDate, language);
  return `${start} - ${end}`;
};

const paymentMethodLabel = (t: (key: string) => string, method: PaymentMethod) => ({
  pix: t('pix'),
  'credit-card': t('creditCard'),
  'debit-card': t('debitCard'),
  'pay-on-site': t('payOnSite'),
}[method]);

export default ManagementPayments;
