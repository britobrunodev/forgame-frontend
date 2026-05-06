import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Lock, Mail, User } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
import { useLanguage } from '@/i18n';
import { authApi } from '@/lib/api';
import { useSession } from '@/session';
import type { UserProfile } from '@/types';

const Register = () => {
  const navigate = useNavigate();
  const { t, userTypeLabel } = useLanguage();
  const { login } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>('player');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    authApi
      .register(name, email, password, selectedProfile)
      .then((result) => {
        login(result.access_token, result.user, result.pending_approval);
        navigate(result.pending_approval ? '/pending-approval' : '/dashboard');
      })
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : t('googleAuthError'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const profileOptions: Array<{ id: UserProfile; icon: typeof User }> = [
    { id: 'player', icon: User },
    { id: 'gestor', icon: Building2 },
  ];

  return (
    <AuthShell mode="register" title={t('createAccount')} subtitle={t('createYourAccount')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('accessProfile')}</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {profileOptions.map(({ id, icon: Icon }) => {
              const selected = selectedProfile === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setSelectedProfile(id);
                  }}
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
              onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
        >
          {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : t('createAccount')}
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

export default Register;
