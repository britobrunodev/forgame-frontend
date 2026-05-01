import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, LayoutDashboard, Trophy, MapPin, Calendar, Building2, ChevronDown, LogOut, Receipt, Settings, SlidersHorizontal, GraduationCap } from 'lucide-react';
import { SPORTS } from '@/data/mock';
import { LanguageSelector } from './LanguageSelector';
import { Logo } from './Logo';
import { SportIcon } from './SportIcon';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, userTypeLabel, sportName, gestorRoleLabel } = useLanguage();
  const { activeProfile, activeGestorRole, currentUser, isGestorMode, availableGestorRoles, setActiveGestorRole } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(
    location.pathname.startsWith('/management') || location.pathname.startsWith('/settings'),
  );
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/championships', label: t('championships'), icon: Trophy },
    { to: '/reservations', label: t('reservations'), icon: MapPin },
    { to: '/schedule', label: t('mySchedule'), icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-30 shrink-0 flex flex-wrap items-center gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t('menu')}</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border bg-sidebar/95 p-0 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-5 py-5">
              <SheetTitle className="sr-only">Joga Junto 360</SheetTitle>
              <Logo />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
              <div className="px-3 mb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('menu')}</div>
              <div className="space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-smooth ${
                        isActive
                          ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
                {isGestorMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => setManagementOpen((current) => !current)}
                      className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-smooth ${
                        managementOpen || location.pathname.startsWith('/management')
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
                        <NavLink
                          to="/management"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Building2 className="h-4 w-4 shrink-0 text-neon-pink" />
                          <span className="truncate">{t('courtManagement')}</span>
                        </NavLink>
                        <NavLink
                          to="/management/championships"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Trophy className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('championships')}</span>
                        </NavLink>
                        <NavLink
                          to="/management/students"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <GraduationCap className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('students')}</span>
                        </NavLink>
                        <NavLink
                          to="/settings/complex"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Building2 className="h-4 w-4 shrink-0 text-neon-pink" />
                          <span className="truncate">{t('sportComplexes')}</span>
                        </NavLink>
                        <NavLink
                          to="/management/payments"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <Receipt className="h-4 w-4 shrink-0 text-neon-pink" />
                          <span className="truncate">{t('managementPayments')}</span>
                        </NavLink>
                        <NavLink
                          to="/management/preferences"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-smooth ${
                              isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                            }`
                          }
                        >
                          <SlidersHorizontal className="h-4 w-4 shrink-0 text-neon-cyan" />
                          <span className="truncate">{t('preferences')}</span>
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
              </div>

              <div className="px-3 pt-6 pb-2 text-[10px] font-display font-bold tracking-[0.25em] text-muted-foreground">{t('sports')}</div>
              <div className="space-y-1">
                {SPORTS.map((sport) => (
                  <NavLink
                    key={sport.id}
                    to={`/sports/${sport.id}`}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth ${
                        isActive ? 'bg-sidebar-accent text-foreground border-l-2 border-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                      } ${currentUser.preferences.includes(sport.id) ? 'font-bold' : 'font-medium'}`
                    }
                  >
                    <SportIcon sportId={sport.id} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{sportName(sport.id)}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="border-t border-border">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4" /> {t('settings')}
              </button>
              <div className="h-px bg-border/80" />
              <SheetClose asChild>
                <button
                  onClick={() => navigate('/login')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground transition-smooth hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" /> {t('logout')}
                </button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="order-3 relative basis-full md:order-none md:max-w-md md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:shadow-glow transition-smooth"
        />
      </div>
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
            {currentUser.name.split(' ').map((name) => name[0]).join('')}
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
          <div className="text-[10px] uppercase tracking-wider text-neon-cyan font-semibold">
            {activeProfile === 'gestor' ? `${userTypeLabel(activeProfile)} · ${gestorRoleLabel(activeGestorRole)}` : userTypeLabel(activeProfile)}
          </div>
        </div>
        <Avatar className="h-10 w-10 border border-primary/20 shadow-neon">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback className="bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
            {currentUser.name.split(' ').map((name) => name[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
};
