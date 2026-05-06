import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Trophy, MapPin, LogOut, Building2, ChevronDown, Receipt, Settings, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { SportIcon } from './SportIcon';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, sportName, gestorRoleLabel } = useLanguage();
  const { isGestorMode, currentUser, activeGestorRole, setActiveGestorRole, availableGestorRoles, logout } = useSession();
  const [managementOpen, setManagementOpen] = useState(
    location.pathname.startsWith('/management') || location.pathname.startsWith('/settings'),
  );
  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/championships', label: t('championships'), icon: Trophy },
    { to: '/reservations', label: t('reservations'), icon: MapPin },
    { to: '/schedule', label: t('mySchedule'), icon: Calendar },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl lg:flex xl:w-64">
      <div className="px-5 py-6 border-b border-border flex justify-center">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('menu')}</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${isActive
                ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {isGestorMode && (
          <>
            <button
              type="button"
              onClick={() => setManagementOpen((current) => !current)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth ${managementOpen || location.pathname.startsWith('/management')
                  ? 'bg-sidebar-accent text-foreground border border-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}
            >
              <Building2 className="w-4 h-4" /> {t('management')}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${managementOpen ? 'rotate-180' : ''}`} />
            </button>
            {managementOpen && (
              <div className="ml-3 space-y-1 border-l border-border pl-3">
                <NavLink
                  to="/management"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Building2 className="h-4 w-4 text-neon-pink" />
                  {t('courtManagement')}
                </NavLink>
                <NavLink
                  to="/management/championships"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Trophy className="h-4 w-4 text-neon-cyan" />
                  {t('championships')}
                </NavLink>
                <NavLink
                  to="/management/classes"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Calendar className="h-4 w-4 text-neon-cyan" />
                  {t('managementClasses')}
                </NavLink>
                <NavLink
                  to="/management/students"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <GraduationCap className="h-4 w-4 text-neon-cyan" />
                  {t('students')}
                </NavLink>
                <NavLink
                  to="/management/users"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Users className="h-4 w-4 text-neon-cyan" />
                  {t('users')}
                </NavLink>
                {currentUser.isAdmin ? (
                  <NavLink
                    to="/management/admin/access"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                      }`
                    }
                  >
                    <ShieldCheck className="h-4 w-4 text-violet-300" />
                    {t('admin')}
                  </NavLink>
                ) : null}
                <NavLink
                  to="/management/approvals"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <ShieldCheck className="h-4 w-4 text-neon-cyan" />
                  {t('approvals')}
                </NavLink>
                <NavLink
                  to="/settings/complex"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Building2 className="h-4 w-4 text-neon-pink" />
                  {t('sportComplexes')}
                </NavLink>
                <NavLink
                  to="/management/payments"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                    }`
                  }
                >
                  <Receipt className="h-4 w-4 text-neon-pink" />
                  {t('managementPayments')}
                </NavLink>
                <div className="rounded-lg border border-border bg-background/30 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('gestorRole')}</div>
                  <Select value={activeGestorRole} onValueChange={(value) => setActiveGestorRole(value as typeof activeGestorRole)}>
                    <SelectTrigger className="h-9 border-border bg-background/60 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                      {availableGestorRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {gestorRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}

        <div className="px-3 pt-6 pb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('sports')}</div>
        {SPORTS.map((s) => (
          <NavLink
            key={s.id}
            to={`/sports/${s.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth ${isActive ? 'bg-sidebar-accent text-foreground border-l-2 border-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              } ${currentUser.preferences.includes(s.id) ? 'font-bold' : 'font-medium'}`
            }
          >
            <SportIcon sportId={s.id} className="h-4 w-4 translate-y-[0.5px]" />
            {sportName(s.id)}
            {currentUser.preferences.includes(s.id) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan))]" />}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 border-t border-border bg-sidebar/95 backdrop-blur-xl">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent"
        >
          <Settings className="w-4 h-4" /> {t('settings')}
        </button>
        <div className="h-px bg-border/80" />
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>
    </aside>
  );
};
