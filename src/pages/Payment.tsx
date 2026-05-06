import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, CreditCard, QrCode, Receipt, ShieldCheck, Wallet } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { getComplexPreference } from '@/lib/complex-preferences-store';
import type { PaymentMethod } from '@/types';

type PaymentState = {
  title?: string;
  description?: string;
  amount?: string;
  backTo?: string;
  complexId?: string;
  summary?: Array<{ label: string; value: string }>;
};

const Payment = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const state = (location.state as PaymentState | null) ?? null;
  const availableMethods = state?.complexId
    ? getComplexPreference(state.complexId).paymentMethods
    : ['pix', 'credit-card', 'debit-card', 'pay-on-site'] satisfies PaymentMethod[];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(availableMethods[0] ?? 'pix');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [pixCopied, setPixCopied] = useState(false);

  const paymentOptions = [
    { id: 'pix' as const, label: t('pix'), icon: QrCode },
    { id: 'credit-card' as const, label: t('creditCard'), icon: CreditCard },
    { id: 'debit-card' as const, label: t('debitCard'), icon: Wallet },
    { id: 'pay-on-site' as const, label: t('payOnSite'), icon: Receipt },
  ];

  return (
    <div className="mx-auto w-full max-w-[min(92rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(100rem,calc(100vw-3rem))]">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('payment')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{state?.description ?? t('paymentDescription')}</p>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">

          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('paymentMethod')}</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentOptions.filter(({ id }) => availableMethods.includes(id)).map(({ id, label, icon: Icon }) => {
                const isActive = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-smooth ${
                      isActive
                        ? 'border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                        : 'border-border bg-background/35 text-foreground hover:border-primary/35'
                    }`}
                  >
                    <Icon className="mb-3 h-5 w-5" />
                    <div className="font-semibold">{label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
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
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="flex flex-col items-center gap-5">
                <p className="text-center text-sm text-muted-foreground">{t('pixScanQr')}</p>
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-border bg-white p-3">
                  <QrCode className="h-full w-full text-black" />
                </div>
                <div className="w-full space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('pixKey')}</div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm text-muted-foreground">
                      00020126580014br.gov.bcb.pix0136joga-junto-360@pix.com.br
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136joga-junto-360@pix.com.br');
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/70 px-3 py-2 text-xs font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {pixCopied ? t('pixKeyCopied') : t('copyPixKey')}
                    </button>
                  </div>
                </div>
              </div>
            )}

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

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('bookingSummary')}</h2>
            </div>

            <div className="space-y-3 text-sm">
              {state?.summary?.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background/30 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
                  <div className="mt-1 font-semibold text-foreground">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('totalPrice')}</div>
              <div className="mt-1 font-display text-3xl font-black text-primary-glow">{state?.amount ?? 'R$ 0,00'}</div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  toast({
                    title: t('payment'),
                    description: `${t('payNow')} · ${state?.amount ?? 'R$ 0,00'}`,
                  });
                }}
                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110"
              >
                {t('payNow')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Payment;
