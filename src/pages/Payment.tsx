import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Copy, CreditCard, QrCode, Receipt, ShieldCheck, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/i18n';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import { complexPreferencesApi, paymentsApi, usersApi } from '@/lib/api';
import type { PixChargeData } from '@/lib/api';
import { useSession } from '@/session';
import type { PaymentMethod } from '@/types';

type PaymentState = {
  paymentId?: number;
  title?: string;
  description?: string;
  amount?: string;
  backTo?: string;
  backToState?: Record<string, unknown>;
  complexId?: string;
  sourceType?: string;
  summary?: Array<{ label: string; value: string }>;
};

type BillingAddress = {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
};

const emptyAddress = (): BillingAddress => ({
  street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '',
});

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { token } = useSession();
  const { paymentId: paymentIdParam } = useParams<{ paymentId: string }>();
  const state = (location.state as PaymentState | null) ?? null;
  const resolvedPaymentId = paymentIdParam ? Number(paymentIdParam) : state?.paymentId;
  const complexIdNumber = state?.complexId
    ? Number(state.complexId)
    : payment?.complex_id ?? null;

  const [pixCharge, setPixCharge] = useState<PixChargeData | null>(null);

  const { data: payment } = useQuery({
    queryKey: ['payment', resolvedPaymentId],
    queryFn: () => paymentsApi.get(token!, resolvedPaymentId!),
    enabled: !!token && !!resolvedPaymentId,
    refetchInterval: pixCharge ? 3000 : false,
  });

  const { data: complexPrefs } = useQuery({
    queryKey: ['complex-preferences', complexIdNumber],
    queryFn: () => complexPreferencesApi.get(token!, complexIdNumber!),
    enabled: !!token && complexIdNumber != null,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getProfile(token!),
    enabled: !!token,
  });

  // Championship payments fall back to general payment_methods if championship-specific list is empty
  const availableMethods = useMemo<PaymentMethod[]>(() => {
    if (!complexPrefs) return ['pix', 'credit-card'];
    const championship = complexPrefs.championship_payment_methods ?? [];
    const general = complexPrefs.payment_methods ?? [];
    const raw = state?.sourceType === 'championship'
      ? (championship.length ? championship : general)
      : general;
    const methods = raw.length ? (raw as PaymentMethod[]) : ['pix', 'credit-card'];
    // Debit card is only available for championship payments
    if (state?.sourceType !== 'championship') {
      return methods.filter(m => m !== 'debit-card');
    }
    return methods;
  }, [complexPrefs, state?.sourceType]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');

  // When available methods change, switch to first non-PIX if current method is no longer available
  useEffect(() => {
    if (!availableMethods.length) return;
    if (availableMethods.includes(paymentMethod)) return;
    const nonPix = availableMethods.filter(m => m !== 'pix');
    setPaymentMethod(nonPix[0] ?? availableMethods[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableMethods]);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [address, setAddress] = useState<BillingAddress>(emptyAddress);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixCpfRequired, setPixCpfRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill CPF and address from profile
  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.document_type === 'cpf' && userProfile.document_number && !cardCpf) {
      setCardCpf(formatCpf(userProfile.document_number));
    }
    setAddress(prev => ({
      street: prev.street || userProfile.address_street || '',
      number: prev.number || userProfile.address_number || '',
      complement: prev.complement || userProfile.address_complement || '',
      neighborhood: prev.neighborhood || userProfile.address_neighborhood || '',
      city: prev.city || userProfile.address_city || '',
      state: prev.state || userProfile.address_state || '',
      zip: prev.zip || userProfile.address_zip || '',
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const handleGeneratePix = () => {
    if (!resolvedPaymentId || !token || isSubmitting) return;
    setIsSubmitting(true);
    paymentsApi.pay(token, resolvedPaymentId, 'pix', { cpf: cardCpf || undefined })
      .then(result => {
        if (result.pix_charge) {
          setPixCharge(result.pix_charge);
          setPixCpfRequired(false);
        }
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Erro ao gerar PIX';
        if (/cpf|cnpj/i.test(msg)) {
          setPixCpfRequired(true);
        } else {
          notify.error(t('payment'), msg);
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  // Auto-generate PIX QR when PIX is selected, unless CPF is still required
  useEffect(() => {
    if (paymentMethod !== 'pix' || pixCharge || !resolvedPaymentId || !token || isSubmitting || pixCpfRequired) return;
    handleGeneratePix();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  // Navigate when PIX is confirmed or paid (polled after webhook fires)
  useEffect(() => {
    if (!pixCharge) return;
    if (payment?.status === 'paid' || payment?.status === 'confirmed') {
      navigate(`/payment/${resolvedPaymentId}/success`, {
        state: { summary: state?.summary, backTo: state?.backTo ?? '/bookings' },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status]);

  const resolvedAmount = useMemo(() => {
    if (state?.amount) return state.amount;
    if (!payment) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(payment.remaining_amount || payment.total_amount || 0);
  }, [payment, state?.amount]);

  const resolvedSummary = useMemo(() => {
    if (state?.summary?.length) return state.summary;
    if (!payment) return [];
    return [
      { label: t('paymentTitle'), value: payment.source_name },
      { label: t('paymentStatusSummary'), value: payment.status },
      { label: t('totalPrice'), value: resolvedAmount },
    ];
  }, [payment, resolvedAmount, state?.summary, t]);

  const paymentOptions = [
    { id: 'pix' as const, label: t('pix'), icon: QrCode },
    { id: 'credit-card' as const, label: t('creditCard'), icon: CreditCard },
    { id: 'debit-card' as const, label: t('debitCard'), icon: Wallet },
    { id: 'pay-on-site' as const, label: t('payOnSite'), icon: Receipt },
  ];

  const handlePay = () => {
    if (!resolvedPaymentId) {
      notify.success(t('payment'), `${t('payNow')} · ${resolvedAmount}`);
      return;
    }
    if (!token) {
      notify.error(t('payment'), 'Pagamento não encontrado.');
      return;
    }

    setIsSubmitting(true);
    const billing = {
      cpf: cardCpf || undefined,
      card_name: cardName || undefined,
      card_number: cardNumber || undefined,
      card_expiry: cardExpiry || undefined,
      card_cvv: cardCvv || undefined,
      address_street: address.street || undefined,
      address_number: address.number || undefined,
      address_complement: address.complement || undefined,
      address_neighborhood: address.neighborhood || undefined,
      address_city: address.city || undefined,
      address_state: address.state || undefined,
      address_zip: address.zip || undefined,
    };

    paymentsApi.pay(token, resolvedPaymentId, paymentMethod, billing)
      .then((result) => {
        if (result.pix_charge && paymentMethod === 'pix') {
          setPixCharge(result.pix_charge);
          return;
        }
        navigate(`/payment/${resolvedPaymentId}/success`, {
          state: { summary: state?.summary, backTo: state?.backTo ?? '/bookings' },
        });
      })
      .catch((err: unknown) => {
        notify.error(t('payment'), err instanceof Error ? err.message : 'Erro ao processar pagamento');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="mx-auto w-full max-w-[min(92rem,calc(100vw-2rem))] space-y-8 pb-24 sm:pb-0 xl:max-w-[min(100rem,calc(100vw-3rem))]">
      <header className="flex items-start gap-4">
        {state?.backTo && (
          <button
            type="button"
            onClick={() => navigate(state.backTo!, { state: state?.backToState })}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('payment')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{state?.description ?? payment?.source_name ?? t('paymentDescription')}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        {/* ── Main panel ──────────────────────────────── */}
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">

          {/* Payment method selector */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentMethod')}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {paymentOptions.filter(({ id }) => availableMethods.includes(id)).map(({ id, label, icon: Icon }) => {
                const isActive = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition-smooth sm:flex-col sm:items-start sm:px-4 sm:py-4 ${
                      isActive
                        ? 'border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                        : 'border-border bg-background/35 text-foreground hover:border-primary/35'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 sm:mb-2 sm:h-5 sm:w-5" />
                    <div className="text-sm font-semibold leading-tight">{label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {/* ── Credit / Debit card form ── */}
            {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('cardHolder')}</div>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="João Silva"
                    className="border-border bg-background/60 text-sm font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('cardNumber')}</div>
                  <Input
                    value={cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                    }}
                    placeholder="0000 0000 0000 0000"
                    className="border-border bg-background/60 font-mono text-sm font-semibold tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('expiryDate')}</div>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                      }}
                      placeholder="MM/YY"
                      className="border-border bg-background/60 font-mono text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('cvv')}</div>
                    <Input
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      type="password"
                      className="border-border bg-background/60 font-mono text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* CPF + Billing address */}
                <div className="mt-2 space-y-4 rounded-2xl border border-border bg-background/20 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Dados do Titular</div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CPF</div>
                    <Input
                      value={cardCpf}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setCardCpf(formatCpf(digits));
                      }}
                      placeholder="000.000.000-00"
                      className="border-border bg-background/60 font-mono text-sm font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_5rem] gap-3 xs:grid-cols-[1fr_5rem]">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Endereço</div>
                      <Input
                        value={address.street}
                        onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="Rua das Flores"
                        className="border-border bg-background/60 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Número</div>
                      <Input
                        value={address.number}
                        onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="123"
                        className="border-border bg-background/60 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Complemento</div>
                      <Input
                        value={address.complement}
                        onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                        placeholder="Apto 42"
                        className="border-border bg-background/60 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bairro</div>
                      <Input
                        value={address.neighborhood}
                        onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                        placeholder="Centro"
                        className="border-border bg-background/60 text-sm"
                      />
                    </div>
                  </div>
                  {/* City · UF · ZIP: on mobile Cidade+UF in one row, CEP below; on sm+ all three inline */}
                  <div className="grid grid-cols-[1fr_4rem] gap-3 sm:grid-cols-[2fr_3rem_5fr]">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cidade</div>
                      <Input
                        value={address.city}
                        onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Belo Horizonte"
                        className="border-border bg-background/60 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">UF</div>
                      <Input
                        value={address.state}
                        onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                        placeholder="MG"
                        className="border-border bg-background/60 text-sm font-mono uppercase"
                      />
                    </div>
                    <div className="col-span-2 space-y-2 sm:col-span-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CEP</div>
                      <Input
                        value={address.zip}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setAddress(prev => ({ ...prev, zip: digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits }));
                        }}
                        placeholder="00000-000"
                        className="border-border bg-background/60 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PIX: generate (with optional CPF prompt if Asaas requires it) ── */}
            {paymentMethod === 'pix' && !pixCharge && !isSubmitting && (
              <div className="space-y-3">
                {pixCpfRequired && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">CPF</div>
                    <Input
                      value={cardCpf}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setCardCpf(formatCpf(digits));
                      }}
                      placeholder="000.000.000-00"
                      className="border-border bg-background/60 font-mono text-sm font-semibold"
                    />
                  </div>
                )}
                <button
                  type="button"
                  disabled={pixCpfRequired && cardCpf.replace(/\D/g, '').length < 11}
                  onClick={handleGeneratePix}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-3 text-sm font-semibold text-neon-cyan transition-smooth hover:bg-neon-cyan/20 disabled:opacity-50"
                >
                  <QrCode className="h-4 w-4" />
                  Gerar QR Code PIX
                </button>
              </div>
            )}

            {/* ── PIX: generating ── */}
            {paymentMethod === 'pix' && isSubmitting && !pixCharge && (
              <div className="flex flex-col items-center gap-5 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary/60">
                  <QrCode className="h-10 w-10 animate-pulse text-neon-cyan/60" />
                </div>
                <p className="text-sm text-muted-foreground">Gerando QR Code PIX via Asaas…</p>
              </div>
            )}

            {/* ── PIX: QR ready ── */}
            {paymentMethod === 'pix' && pixCharge && (
              <div className="flex flex-col items-center gap-5">
                <img
                  src={`data:image/png;base64,${pixCharge.qr_code_image}`}
                  alt="PIX QR Code"
                  className="aspect-square w-full max-w-[13rem] rounded-2xl border-2 border-border bg-white p-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pixCharge.qr_code_payload);
                    setPixCopied(true);
                    setTimeout(() => setPixCopied(false), 2000);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-3 text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary"
                >
                  <Copy className="h-4 w-4" />
                  {pixCopied ? t('pixKeyCopied') : t('copyPixKey')}
                </button>
                {pixCharge.expiration_date && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Expira: {pixCharge.expiration_date}
                  </div>
                )}
              </div>
            )}

            {/* ── Pay on site ── */}
            {paymentMethod === 'pay-on-site' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary/60">
                  <Receipt className="h-8 w-8 text-neon-pink" />
                </div>
                <p className="max-w-sm text-sm text-muted-foreground">{t('payOnSiteInfo')}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('bookingSummary')}</h2>
            </div>

            <div className="space-y-3 text-sm">
              {resolvedSummary.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
                  <div className="mt-1 font-semibold text-foreground">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('totalPrice')}</div>
              <div className="mt-1 font-display text-3xl font-black text-primary-glow">{resolvedAmount}</div>
            </div>


            {/* Pay button — hidden on mobile (sticky bar handles it); visible on sm+ */}
            {paymentMethod !== 'pix' && (
              <div className="mt-5 hidden sm:block">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePay}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:opacity-60"
                >
                  {isSubmitting ? '...' : t('payNow')}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('totalPrice')}</div>
          <div className="font-display text-xl font-black text-primary-glow">{resolvedAmount}</div>
        </div>
        {paymentMethod !== 'pix' && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePay}
            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? '...' : t('payNow')}
          </button>
        )}
      </div>
    </div>
  );
};

const formatCpf = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
};

export default Payment;
