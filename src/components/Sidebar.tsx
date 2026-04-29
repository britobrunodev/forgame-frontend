import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Trophy, MapPin, Settings, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { SPORTS, CURRENT_USER } from '@/data/mock';
import { useLanguage } from '@/i18n';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { t, sportName } = useLanguage();
  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/championships', label: t('championships'), icon: Trophy },
    { to: '/reservations', label: t('reservations'), icon: MapPin },
    { to: '/schedule', label: t('mySchedule'), icon: Calendar },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl">
      <div className="px-5 py-6 border-b border-border flex justify-center">
        <Logo />
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('menu')}</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${
                isActive
                  ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        <div className="px-3 pt-6 pb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('sports')}</div>
        {SPORTS.map((s) => (
          <NavLink
            key={s.id}
            to={`/sports/${s.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth ${
                isActive ? 'bg-sidebar-accent text-foreground border-l-2 border-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              } ${CURRENT_USER.preferences.includes(s.id) ? 'font-bold' : 'font-medium'}`
            }
          >
            <span className="text-base">{s.icon}</span>
            {sportName(s.id)}
            {CURRENT_USER.preferences.includes(s.id) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan))]" />}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent">
          <Settings className="w-4 h-4" /> {t('settings')}
        </button>
        <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>
    </aside>
  );
};
