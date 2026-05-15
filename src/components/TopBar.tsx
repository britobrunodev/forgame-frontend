import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  LayoutDashboard,
  Trophy,
  MapPin,
  Calendar,
  Building2,
  ChevronDown,
  LogOut,
  GraduationCap,
  Users,
  ClipboardList,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, gestorRoleLabel } = useLanguage();

  const {
    currentUser,
    isGestorMode,
  } = useSession();
  const canManage = isGestorMode || currentUser.isAdmin;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(
    location.pathname.startsWith('/management'),
  );

  const accessLabel = (() => {
    if (currentUser.isAdmin) return t('admin');
    if (currentUser.roles?.includes('owner')) return gestorRoleLabel('owner');
    if (currentUser.roles?.includes('manager')) return gestorRoleLabel('manager');
    if (currentUser.roles?.includes('professor')) return gestorRoleLabel('professor');
    if (currentUser.roles?.includes('referee')) return gestorRoleLabel('referee');
    if (currentUser.roles?.includes('scorer')) return t('scorer');
    return t('player');
  })();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, disabled: false },
    { to: '/championships', label: t('championships'), icon: Trophy, disabled: false },
    { to: '/reservations', label: t('reservations'), icon: MapPin, disabled: true },
    { to: '/bookings', label: t('mySchedule'), icon: ClipboardList, disabled: false },
  ];

  return (
    <header
      className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/70 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
    <div className="flex h-[66px] items-center gap-3 px-4 sm:h-[74px] sm:px-6">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t('menu')}</span>
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[62vw] max-w-xs border-r border-border bg-sidebar/95 p-0 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              <div className="flex h-[66px] items-center justify-center px-3 sm:h-[74px]">
                <SheetTitle className="sr-only">Forgame</SheetTitle>
                <img
                  src="/forgame_logo.png"
                  alt="Forgame"
                  className="h-[3.7rem] w-auto object-contain"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
              <div className="px-3 mb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">
                {t('menu')}
              </div>

              <div className="space-y-1">
                {navItems.map(({ to, label, icon: Icon, disabled }) =>
                  disabled ? (
                    <span
                      key={to}
                      className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold cursor-not-allowed opacity-40 text-sidebar-foreground select-none"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </span>
                  ) : (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-smooth ${isActive
                        ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                  ),
                )}

                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setManagementOpen((current) => !current)}
                      className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-smooth ${managementOpen || location.pathname.startsWith('/management')
                          ? 'bg-sidebar-accent text-foreground border border-primary/30'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                        }`}
                    >
                      <div className="grid min-w-0 flex-1 grid-cols-[16px_minmax(0,1fr)] items-center gap-3 text-left">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{t('management')}</span>
                      </div>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${managementOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {managementOpen && (
                      <div className="ml-3 space-y-1 border-l border-border pl-3">
                        <span className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                          <Building2 className="h-4 w-4 shrink-0 text-neon-pink" />
                          <span className="truncate">{t('courtManagement')}</span>
                        </span>

                        <NavLink
                          to="/management/championships"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Trophy className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('championships')}</span>
                        </NavLink>

                        <span className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                          <Calendar className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('managementClasses')}</span>
                        </span>

                        <span className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none opacity-40 text-sidebar-foreground">
                          <GraduationCap className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('students')}</span>
                        </span>

                        {currentUser.isAdmin ? (
                          <NavLink
                            to="/admin/approvals"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                              }`
                            }
                          >
                            <ClipboardList className="h-4 w-4 shrink-0 text-violet-300" />
                            <span className="truncate">{t('approvals')}</span>
                          </NavLink>
                        ) : null}

                        <NavLink
                          to="/management/complexes"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Building2 className="h-4 w-4 shrink-0 text-neon-pink" />
                          <span className="truncate">{t('sportComplexes')}</span>
                        </NavLink>

                      </div>
                    )}
                  </>
                )}

              </div>
            </div>

            <div className="border-t border-border">
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex w-full items-center justify-center gap-3 px-4 py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" /> {t('logout')}
                </button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="order-3 flex-1 md:order-none" />

      <ThemeSelector />
      <LanguageSelector />

      <button className="relative p-2 rounded-lg hover:bg-secondary/60 transition-smooth">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_hsl(var(--neon-pink))]" />
      </button>

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-secondary/60"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback className="bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
            {currentUser.name
              .split(' ')
              .map((name) => name[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </button>

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="hidden sm:flex items-center gap-3 pl-4 border-l border-border transition-smooth hover:text-foreground"
      >
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold leading-tight">{currentUser.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-primary dark:text-lime-400 font-semibold">
            {accessLabel}
          </div>
        </div>

        <Avatar className="h-10 w-10 border border-primary/20 shadow-neon">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback className="bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
            {currentUser.name
              .split(' ')
              .map((name) => name[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </button>
    </div>
    </header>
  );
};
