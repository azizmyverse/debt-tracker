import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { cn } from '../utils/cn.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/data', label: 'Data Hutang', icon: Wallet },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { stats } = useDebts();

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex items-center px-4 py-5',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {collapsed ? (
          <Logo withText={false} />
        ) : (
          <Logo />
        )}
        <button
          aria-label="Tutup menu"
          onClick={onCloseMobile}
          className="lg:hidden text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 shadow-soft'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800/70 hover:text-ink-900 dark:hover:text-ink-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                  )}
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform group-hover:scale-110',
                      isActive ? 'text-brand-600 dark:text-brand-300' : ''
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-fuchsia-600 p-4 text-white shadow-glow animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">
            Insight
          </p>
          <p className="mt-1 text-sm font-medium leading-snug">
            {stats.countOverdue > 0
              ? `${stats.countOverdue} hutang sudah jatuh tempo`
              : 'Semua hutang masih on-track 👍'}
          </p>
          <p className="mt-2 text-xs opacity-80">
            Pantau status keuanganmu di Analytics.
          </p>
        </div>
      )}

      <button
        onClick={onToggleCollapse}
        className={cn(
          'mx-3 mb-4 hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors',
          collapsed ? 'justify-center' : 'justify-start'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronsRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronsLeft className="h-4 w-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-ink-200/70 dark:border-ink-800/70 bg-white/80 dark:bg-ink-900/60 backdrop-blur-xl transition-[width] duration-300',
          collapsed ? 'w-[78px]' : 'w-64'
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 transition-opacity',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-72 surface border-r border-ink-200/70 dark:border-ink-800/70 transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
