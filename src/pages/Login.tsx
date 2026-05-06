import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Lock, Mail, User } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthShell } from '@/components/AuthShell';
import { useLanguage } from '@/i18n';
import { authApi } from '@/lib/api';
import { useSession } from '@/session';
import type { UserProfile } from '@/types';

const Login = () => {
  const navigate = useNavigate();
  const { t, userTypeLabel } = useLanguage();
  const { activeProfile, setActiveProfile, setAvailableProfiles, setAvailableGestorRoles, updateCurrentUser, login } = useSession();
  const googleClientIdConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGoogleError(null);
      try {
        const result = await authApi.googleLogin(tokenResponse.access_token, activeProfile);
        login(result.access_token, result.user, result.pending_approval);
        navigate(result.pending_approval ? '/pending-approval' : '/dashboard');
      } catch (err) {
        setGoogleError(err instanceof Error ? err.message : t('googleAuthError'));
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleError(t('googleAuthError')),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateCurrentUser({ type: activeProfile === 'gestor' ? 'gestor' : 'player' });
    if (activeProfile === 'gestor') setAvailableGestorRoles(['owner', 'manager', 'professor']);
    navigate('/dashboard');
  };

  const profileOptions: Array<{ id: UserProfile; icon: typeof User }> = [
    { id: 'player', icon: User },
    { id: 'gestor', icon: Building2 },
  ];

  return (
    <AuthShell mode="login" title={t('login')} subtitle={t('loginIntro')}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('accessProfile')}</label>
          <div className="flex gap-2">
            {profileOptions.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setAvailableProfiles(['player', 'gestor']);
                  setActiveProfile(id);
                }}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-smooth ${
                  activeProfile === id
                    ? 'border-primary/50 bg-primary/12 text-neon-cyan shadow-glow'
                    : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{userTypeLabel(id)}</span>
              </button>
            ))}
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
              placeholder="player@jogajunto360.com"
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

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-primary py-2.5 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
        >
          {t('login')}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('or')}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <button
          onClick={() => googleLogin()}
          disabled={googleLoading || !googleClientIdConfigured}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-secondary py-2.5 text-sm font-semibold transition-smooth hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {t('continueWithGoogle')}
        </button>

        {!googleClientIdConfigured && (
          <p className="text-center text-xs text-muted-foreground">
            Google login is not configured yet. Set `VITE_GOOGLE_CLIENT_ID` in the frontend environment.
          </p>
        )}

        {googleError && (
          <p className="text-center text-xs text-destructive">{googleError}</p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t('newHere')}{' '}
        <Link to="/register" className="text-[11px] leading-none font-semibold uppercase tracking-[0.06em] text-neon-cyan transition-smooth hover:text-primary-glow">
          {t('createAccountCta')}
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
