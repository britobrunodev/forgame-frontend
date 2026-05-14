import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
import { useLanguage } from '@/i18n';
import { authApi } from '@/lib/api';
import { useSession } from '@/session';
import type { UserProfile } from '@/types';

type Step = 'form' | 'verify';

const Register = () => {
  const navigate = useNavigate();
  const { t, userTypeLabel } = useLanguage();
  const { login } = useSession();

  const [step, setStep] = useState<Step>('form');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>('player');

  // Verify step
  const [code, setCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setSubmitError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await authApi.sendVerification(email);
      setStep('verify');
    } catch (err) {
      setSubmitError(translateAuthError(err instanceof Error ? err.message : ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await authApi.verifyCode(email, code);
      const result = await authApi.register(name, email, password, selectedProfile);
      login(result.access_token, result.user, result.pending_approval);
      navigate(result.pending_approval ? '/pending-approval' : '/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Código') || msg.includes('expirado') || msg.includes('inválido')) {
        setSubmitError(msg);
      } else {
        setSubmitError(translateAuthError(msg));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const profileOptions: Array<{ id: UserProfile; icon: typeof User }> = [
    { id: 'player', icon: User },
    { id: 'gestor', icon: Building2 },
  ];

  if (step === 'verify') {
    return (
      <AuthShell mode="register" title="Confirmar e-mail" isLoading={submitting}>
        <div className="mb-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck className="mb-1 inline h-4 w-4 text-neon-cyan" />
          {' '}Enviamos um código de 6 dígitos para{' '}
          <span className="font-semibold text-foreground">{email}</span>.
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Código de verificação
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-lg border border-border bg-background/60 py-3 text-center text-2xl font-bold tracking-[0.4em] transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || code.length < 6}
            className="w-full rounded-lg bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Criar conta'}
          </button>

          {submitError && (
            <p className="text-center text-xs text-destructive">{submitError}</p>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          E-mail errado?{' '}
          <button
            type="button"
            onClick={() => { setStep('form'); setCode(''); setSubmitError(null); }}
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neon-cyan transition-smooth hover:text-primary-glow"
          >
            Voltar
          </button>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="register" title={t('createAccount')} isLoading={submitting}>
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('accessProfile')}</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {profileOptions.map(({ id, icon: Icon }) => {
              const selected = selectedProfile === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setSubmitError(null); setSelectedProfile(id); }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-center text-[11px] transition-smooth ${
                    selected
                      ? 'border-primary/50 bg-primary/12 text-foreground shadow-glow'
                      : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? 'text-neon-cyan' : 'text-muted-foreground'}`} />
                  <span className="font-semibold uppercase tracking-[0.12em]">{userTypeLabel(id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('fullName')}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rafael Souza"
              className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@forgame.com.br"
              className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('password')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:outline-none focus:shadow-glow ${
                passwordMismatch ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
              }`}
            />
          </div>
          {passwordMismatch && (
            <p className="mt-1 text-xs text-destructive">As senhas não coincidem.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || passwordMismatch}
          className="w-full rounded-lg bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Continuar'}
        </button>

        {submitError && (
          <p className="text-center text-xs text-destructive">{submitError}</p>
        )}
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-[11px] leading-none font-semibold uppercase tracking-[0.06em] text-neon-cyan transition-smooth hover:text-primary-glow">
          {t('goToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
};

const translateAuthError = (raw: string): string => {
  const lower = raw.toLowerCase();
  if (lower.includes('email já cadastrado') || lower.includes('already registered') || lower.includes('already exists')) {
    return 'E-mail já cadastrado.';
  }
  if (lower.includes('invalid email') || lower.includes('email inválido')) {
    return 'E-mail inválido.';
  }
  if (lower.includes('password') || lower.includes('senha')) {
    return 'Senha inválida.';
  }
  if (lower.includes('invalid') || lower.includes('inválido')) {
    return 'E-mail ou senha inválidos.';
  }
  return raw || 'Erro ao criar conta. Tente novamente.';
};

export default Register;
