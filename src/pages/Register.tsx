import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, User } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import type { UserProfile } from '@/types';

const Register = () => {
  const navigate = useNavigate();
  const { t, userTypeLabel } = useLanguage();
  const { setAvailableProfiles, setActiveProfile, setAvailableGestorRoles, updateCurrentUser } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>(['player']);

  const toggleProfile = (profile: UserProfile) => {
    setSelectedProfiles((current) => {
      if (current.includes(profile)) {
        return current.length === 1 ? current : current.filter((item) => item !== profile);
      }
      return [...current, profile];
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateCurrentUser({
      name,
      email,
      type: selectedProfiles.includes('gestor') ? 'gestor' : 'player',
      profiles: selectedProfiles,
      gestorRoles: selectedProfiles.includes('gestor') ? ['owner', 'manager', 'professor'] : [],
    });
    setAvailableProfiles(selectedProfiles);
    if (selectedProfiles.includes('gestor')) {
      setAvailableGestorRoles(['owner', 'manager', 'professor']);
    }
    setActiveProfile(selectedProfiles[0] ?? 'player');
    navigate('/dashboard');
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
          <p className="mb-3 text-xs text-muted-foreground">{t('accessProfileHint')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {profileOptions.map(({ id, icon: Icon }) => {
              const selected = selectedProfiles.includes(id);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleProfile(id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-smooth ${
                    selected
                      ? 'border-primary/50 bg-primary/12 text-foreground shadow-glow'
                      : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? 'text-neon-cyan' : 'text-muted-foreground'}`} />
                  <span className="font-semibold">{userTypeLabel(id)}</span>
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm transition-smooth focus:border-primary focus:shadow-glow focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-widest shadow-neon transition-smooth hover:brightness-110 hover:shadow-glow"
        >
          {t('createAccount')}
        </button>
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
