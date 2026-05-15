import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trophy, MapPin, LogOut, Building2, ChevronDown, ChevronLeft, ChevronRight, Receipt, GraduationCap, ShieldCheck, ClipboardList, Calendar } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const COLLAPSED_KEY = 'joga-junto-sidebar-collapsed';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isGestorMode, currentUser, logout } = useSession();
  const canManage = isGestorMode || currentUser.isAdmin;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) !== 'false');
  const [managementOpen, setManagementOpen] = useState(
    location.pathname.startsWith('/management'),
  );
  const [adminOpen, setAdminOpen] = useState(location.pathname.startsWith('/admin'));

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      if (next) {
        setManagementOpen(false);
        setAdminOpen(false);
      }
      return next;
    });
  };

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, disabled: false },
    { to: '/championships', label: t('championships'), icon: Trophy, disabled: false },
    { to: '/reservations', label: t('reservations'), icon: MapPin, disabled: true },
    { to: '/bookings', label: t('mySchedule'), icon: ClipboardList, disabled: false },
  ];

  const subLinkClass = (isActive: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
      isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
    }`;

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl lg:flex transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-60 xl:w-64'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative flex h-[74px] items-center justify-center border-b border-border px-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="flex h-full items-center justify-center"
        >
          {collapsed
            ? <img src="/apple-touch-icon.png" alt="Forgame" className="h-10 w-10 object-contain" />
            : <img src="/forgame_logo.png" alt="Forgame" className="h-[4.44rem] w-auto object-contain" />
          }
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-sidebar/95 text-muted-foreground backdrop-blur-sm transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5 space-y-1">
        {!collapsed && (
          <div className="px-3 mb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('menu')}</div>
        )}

        {navItems.map(({ to, label, icon: Icon, disabled }) =>
          disabled ? (
            <span
              key={to}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-lg text-sm font-semibold cursor-not-allowed opacity-40 text-sidebar-foreground select-none ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
              }`}
            >
              <Icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!collapsed && label}
            </span>
          ) : (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-sm font-semibold transition-smooth ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`
              }
            >
              <Icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!collapsed && label}
            </NavLink>
          ),
        )}

        {canManage && !collapsed && (
          <>
            <button
              type="button"
              onClick={() => setManagementOpen((current) => !current)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth ${
                managementOpen || location.pathname.startsWith('/management')
                  ? 'bg-sidebar-accent text-foreground border border-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" /> {t('management')}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${managementOpen ? 'rotate-180' : ''}`} />
            </button>
            {managementOpen && (
              <div className="ml-3 space-y-1 border-l border-border pl-3">
                <NavLink to="/management/championships" className={({ isActive }) => subLinkClass(isActive)}>
                  <Trophy className="h-4 w-4 text-neon-cyan" />
                  {t('championships')}
                </NavLink>
                <NavLink to="/management/payments" className={({ isActive }) => subLinkClass(isActive)}>
                  <Receipt className="h-4 w-4 text-neon-pink" />
                  {t('managementPayments')}
                </NavLink>
                <NavLink to="/management/complexes" className={({ isActive }) => subLinkClass(isActive)}>
                  <Building2 className="h-4 w-4 text-neon-pink" />
                  {t('sportComplexes')}
                </NavLink>
                <span className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                  <Building2 className="h-4 w-4 text-neon-pink" />
                  {t('courtManagement')}
                </span>
                <span className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                  <Calendar className="h-4 w-4 text-neon-cyan" />
                  {t('managementClasses')}
                </span>
                <span className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                  <GraduationCap className="h-4 w-4 text-neon-cyan" />
                  {t('students')}
                </span>
              </div>
            )}
          </>
        )}

        {canManage && collapsed && (
          <NavLink
            to="/management"
            title={t('management')}
            className={({ isActive }) =>
              `flex justify-center rounded-lg px-0 py-2.5 text-sm transition-smooth ${
                isActive || location.pathname.startsWith('/management')
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`
            }
          >
            <Building2 className="w-5 h-5" />
          </NavLink>
        )}

        {currentUser.isAdmin && !collapsed && (
          <>
            <button
              type="button"
              onClick={() => setAdminOpen((current) => !current)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth ${
                adminOpen || location.pathname.startsWith('/admin')
                  ? 'bg-sidebar-accent text-foreground border border-violet-400/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-violet-300 shrink-0" /> {t('admin')}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
            </button>
            {adminOpen && (
              <div className="ml-3 space-y-1 border-l border-border pl-3">
                <NavLink to="/admin/approvals" className={({ isActive }) => subLinkClass(isActive)}>
                  <ClipboardList className="h-4 w-4 text-violet-300" />
                  Aprovações
                </NavLink>
                <NavLink to="/admin/complexes" className={({ isActive }) => subLinkClass(isActive)}>
                  <Building2 className="h-4 w-4 text-violet-300" />
                  Complexos
                </NavLink>
              </div>
            )}
          </>
        )}

        {currentUser.isAdmin && collapsed && (
          <NavLink
            to="/admin"
            title={t('admin')}
            className={({ isActive }) =>
              `flex justify-center rounded-lg px-0 py-2.5 text-sm transition-smooth ${
                isActive || location.pathname.startsWith('/admin')
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5 text-violet-300" />
          </NavLink>
        )}
      </nav>

      <div className="shrink-0 border-t border-border bg-sidebar/95 backdrop-blur-xl">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          title={collapsed ? t('logout') : undefined}
          className={`flex w-full items-center py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent ${
            collapsed ? 'justify-center px-0' : 'gap-3 px-4'
          }`}
        >
          <LogOut className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!collapsed && t('logout')}
        </button>
      </div>
    </aside>
  );
};
