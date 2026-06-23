/**
 * Layout principal con sidebar responsive.
 * Mobile: overlay con backdrop. Desktop: collapsible sidebar.
 */
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HelpAgent from '../ui/HelpAgent';
import {
  IconDashboard, IconCode, IconTrophy, IconSend,
  IconUsers, IconTarget, IconUser, IconKey,
  IconChevronLeft, IconChevronRight, IconMenu, IconClose, IconLogout,
} from '../ui/Icons';

const navigation = [
  { name: 'Dashboard',      path: '/dashboard',    icon: IconDashboard },
  { name: 'Problemas',      path: '/problems',     icon: IconCode },
  { name: 'Competencias',   path: '/contests',     icon: IconTrophy },
  { name: 'Envíos',         path: '/submissions',  icon: IconSend },
  { name: 'Equipos',        path: '/teams',        icon: IconUsers },
  { name: 'Entrenamientos', path: '/trainings',    icon: IconTarget },
];

const adminNavigation = [
  { name: 'Panel de Control', path: '/admin/dashboard', icon: IconKey },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = (user as any)?.role === 'admin' || user?.role_name === 'admin';
  const isCoach = (user as any)?.role === 'coach' || user?.role_name === 'coach';
  const userInitials = `${(user?.first_name?.[0] || '').toUpperCase()}${(user?.last_name?.[0] || '').toUpperCase()}` || 'U';

  const renderNav = (collapsed: boolean) => (
    <>
      <p className={`text-[10px] uppercase tracking-widest text-surface-500 font-display font-semibold mb-3 ${collapsed ? 'text-center' : 'px-3'}`}>
        {collapsed ? '·' : 'Principal'}
      </p>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.name}
            data-tour={`tour-${item.name.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/15'
                  : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200 border border-transparent'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        );
      })}

      {(isAdmin || isCoach) && (
        <>
          <div className="pt-5">
            <p className={`text-[10px] uppercase tracking-widest text-surface-500 font-display font-semibold mb-3 ${collapsed ? 'text-center' : 'px-3'}`}>
              {collapsed ? '·' : 'Admin'}
            </p>
          </div>
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label={item.name}
                data-tour="tour-admin-panel"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-500/10 text-accent-400 border border-accent-500/15'
                      : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200 border border-transparent'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </>
      )}
    </>
  );

  const sidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-surface-800/60 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-sm shadow-lg shadow-primary-600/25 flex-shrink-0">
            IC
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-display font-bold text-surface-100 tracking-tight">ICPC UAGRM</h1>
              <p className="text-[10px] text-surface-500 font-display">Programación Competitiva</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        {renderNav(collapsed)}
      </nav>

      {/* User profile + Toggle */}
      <div className="border-t border-surface-800/60 p-3 space-y-2">
        {/* User info */}
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-900/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-display font-bold flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{user?.first_name || user?.username}</p>
              <p className="text-[10px] text-surface-500 font-display">{user?.role_display || 'Sin rol'}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-display font-bold" title={user?.first_name || user?.username}>
              {userInitials}
            </div>
          </div>
        )}

        {/* Desktop toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
          className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-surface-500 hover:bg-surface-800/60 hover:text-surface-300 transition-all"
        >
          {sidebarOpen ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-950 border-r border-surface-800/60 flex flex-col transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-4 right-3 p-1.5 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800"
        >
          <IconClose className="w-5 h-5" />
        </button>
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex ${
          sidebarOpen ? 'w-60' : 'w-[68px]'
        } bg-surface-950 border-r border-surface-800/40 flex-col transition-all duration-300 flex-shrink-0`}
        aria-label="Menú de navegación"
      >
        {sidebarContent(!sidebarOpen)}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 glass border-b border-surface-700/30 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="lg:hidden p-2 -ml-1 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/60"
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <p className="text-surface-400 text-sm">
              Bienvenido, <span className="text-surface-100 font-semibold font-display">{user?.first_name || user?.username}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              data-tour="tour-role-badge"
              className="badge bg-primary-500/10 text-primary-400 border border-primary-500/15"
            >
              {user?.role_display || 'Sin rol'}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              data-tour="tour-logout"
              className="btn-ghost btn-sm gap-1.5 text-surface-500 hover:text-red-400"
            >
              <IconLogout className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-surface-900 bg-dot-pattern">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
        <HelpAgent />
      </div>
    </div>
  );
}
