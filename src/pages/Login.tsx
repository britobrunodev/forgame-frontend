import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/i18n';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 hex-grid opacity-40" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center justify-center">
            <h1 className="font-display font-black text-3xl tracking-wider neon-text">JOGA JUNTO</h1>
            <div className="font-display text-xs font-bold tracking-[0.5em] text-neon-cyan mt-1">— 360 —</div>
          </div>
          <p className="text-muted-foreground text-sm mt-3 font-medium">{t('createYourAccount')}</p>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card backdrop-blur-xl p-7 shadow-card neon-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{t('fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rafael Souza"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background/60 border border-border text-sm focus:outline-none focus:border-primary focus:shadow-glow transition-smooth"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@jogajunto360.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background/60 border border-border text-sm focus:outline-none focus:border-primary focus:shadow-glow transition-smooth"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background/60 border border-border text-sm focus:outline-none focus:border-primary focus:shadow-glow transition-smooth"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-primary font-display font-bold text-sm tracking-widest uppercase shadow-neon hover:shadow-glow hover:brightness-110 transition-smooth"
            >
              {t('createAccount')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('or')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 rounded-lg bg-secondary border border-border hover:border-primary/40 text-sm font-semibold flex items-center justify-center gap-3 transition-smooth"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('continueWithGoogle')}
          </button>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-6 font-bold">
          {t('sportsManagement')}
        </p>
      </div>
    </div>
  );
};

export default Login;
