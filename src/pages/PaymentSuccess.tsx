import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Loader2, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { useSession } from '@/session';

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
  PAY_ON_SITE: 'No local',
  BOLETO: 'Boleto',
};

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { token } = useSession();

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', Number(paymentId)],
    queryFn: () => paymentsApi.get(token!, Number(paymentId)),
    enabled: !!token && !!paymentId,
  });

  const paidTransaction = useMemo(() => {
    if (!payment?.transactions?.length) return null;
    const confirmed = payment.transactions.filter(
      (tx) => tx.status === 'confirmed' || tx.status === 'received',
    );
    const sorted = (confirmed.length ? confirmed : payment.transactions).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return sorted[0];
  }, [payment]);

  const formattedAmount = useMemo(() => {
    if (!payment) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      payment.total_amount,
    );
  }, [payment]);

  const sourceDateTime = useMemo(() => {
    const rawDate = payment?.category_start_date ?? payment?.source_date;
    if (!rawDate) return null;
    const d = new Date(`${rawDate}T12:00:00`).toLocaleDateString('pt-BR');
    const time = payment?.category_start_time;
    return time ? `${d} às ${time}` : d;
  }, [payment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!payment || (payment.status !== 'paid' && payment.status !== 'confirmed')) {
    return <Navigate to="/bookings" replace />;
  }

  const referenceCode = `#${String(payment.id).padStart(6, '0')}`;
  const methodLabel = paidTransaction
    ? (METHOD_LABELS[paidTransaction.method] ?? paidTransaction.method)
    : '—';
  const paidAt = paidTransaction
    ? new Date(paidTransaction.created_at).toLocaleString('pt-BR')
    : new Date(payment.created_at).toLocaleString('pt-BR');

  return (
    <div className="mx-auto w-full max-w-[min(46rem,calc(100vw-2rem))] space-y-6">

      {/* ── Success header ── */}
      <div className="flex flex-col items-center gap-4 py-8 text-center print:hidden">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-neon-cyan/10 shadow-[0_0_40px_hsl(var(--neon-cyan)/0.30)]" />
          <div className="absolute inset-2 rounded-full border-2 border-neon-cyan/30" />
          <CheckCircle2 className="relative h-12 w-12 text-neon-cyan" />
        </div>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">
            Pagamento confirmado
          </p>
          <h1 className="mt-1 font-display text-3xl font-black">Obrigado!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu pagamento foi processado com sucesso. Guarde este comprovante.
          </p>
        </div>
      </div>

      {/* ── Receipt card ── */}
      <div className="rounded-[2rem] border border-border bg-gradient-card shadow-card print:rounded-none print:border-none print:shadow-none">

        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <span className="font-display text-sm font-bold uppercase tracking-[0.22em]">
            Comprovante de Pagamento
          </span>
          <span className="ml-auto font-mono text-xs text-muted-foreground">{referenceCode}</span>
        </div>

        <div className="space-y-2 p-6">

          {/* Status from DB */}
          <Row label="Status">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neon-cyan">
              <CheckCircle2 className="h-3 w-3" />
              {payment.status === 'confirmed' ? 'Confirmado' : 'Pago'}
            </span>
          </Row>

          {/* Description from DB */}
          <Row label="Descrição" value={payment.source_name} />
          {sourceDateTime && <Row label="Data do evento" value={sourceDateTime} />}

          <div className="!my-4 border-t border-dashed border-border" />

          {/* Billing details from DB */}
          <Row label="Titular" value={payment.user_name} />
          <Row label="E-mail" value={payment.user_email} />
          <Row label="Método" value={methodLabel} />
          <Row label="Pago em" value={paidAt} />

          {/* Amount from DB */}
          <div className="!mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Total pago
            </div>
            <div className="mt-1 font-display text-4xl font-black text-primary-glow">
              {formattedAmount}
            </div>
          </div>

        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 pb-6 sm:flex-row print:hidden">
        <Link
          to="/bookings"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
        >
          <ClipboardList className="h-4 w-4" />
          Ver minhas inscrições
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-glow transition-smooth hover:border-primary/40 hover:bg-primary/15"
        >
          <Printer className="h-4 w-4" />
          Imprimir comprovante
        </button>
      </div>

    </div>
  );
};

const Row = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/30 px-4 py-3">
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </span>
    {children ?? (
      <span className="text-right text-sm font-semibold text-foreground">{value ?? '—'}</span>
    )}
  </div>
);

export default PaymentSuccess;
