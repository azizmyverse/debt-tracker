import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { cn } from '../utils/cn.js';
import { formatRupiah, formatDateID } from '../utils/format.js';

export default function Topbar({ onOpenMobileMenu }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { debts, stats } = useDebts();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const overdue = debts
    .filter((d) => d.status !== 'lunas' && new Date(d.dueDate) <= new Date())
    .slice(0, 5);

  const results =
    query.trim().length > 0
      ? debts
          .filter((d) =>
            (d.name + ' ' + d.bank)
              .toLowerCase()
              .includes(query.toLowerCase())
          )
          .slice(0, 6)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200/70 dark:border-ink-800/70 bg-white/70 dark:bg-ink-950/60 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          aria-label="Open menu"
          onClick={onOpenMobileMenu}
          className="lg:hidden btn-ghost p-2"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Cari nama, bank, atau status…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="input pl-9 pr-12"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-ink-200 dark:border-ink-700 px-1.5 py-0.5 text-[10px] font-medium text-ink-500 dark:text-ink-400">
              ⌘ K
            </kbd>
          </div>
          {searchOpen && query.trim() && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl card p-2 animate-fade-in shadow-soft-lg z-30">
              {results.length === 0 ? (
                <div className="p-4 text-center text-sm text-ink-500 dark:text-ink-400">
                  Tidak ada hasil untuk &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      navigate('/data');
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">
                        {d.name}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {d.bank} • {formatDateID(d.dueDate)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-100 tabular-nums">
                      {formatRupiah(d.amount)}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="btn-ghost p-2.5 relative overflow-hidden"
          >
            <span className="relative">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" />
              )}
            </span>
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((o) => !o)}
              className="btn-ghost p-2.5 relative"
            >
              <Bell className="h-5 w-5" />
              {overdue.length > 0 && (
                <span className="absolute top-1.5 right-1.5 inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-950 animate-pulse" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl card shadow-soft-lg animate-scale-in p-2 origin-top-right z-30">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    Notifikasi
                  </span>
                  <span className="text-xs text-ink-500">{overdue.length} jatuh tempo</span>
                </div>
                <div className="max-h-72 overflow-auto">
                  {overdue.length === 0 ? (
                    <div className="p-4 text-center text-sm text-ink-500 dark:text-ink-400">
                      Tidak ada hutang yang jatuh tempo. 🎉
                    </div>
                  ) : (
                    overdue.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          navigate('/data');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                      >
                        <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-rose-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">
                            {d.name}
                          </div>
                          <div className="text-xs text-ink-500 dark:text-ink-400">
                            Jatuh tempo {formatDateID(d.dueDate)} •{' '}
                            {formatRupiah(d.amount)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className={cn(
                'flex items-center gap-2 rounded-xl border border-transparent pl-1.5 pr-2 py-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors',
                profileOpen && 'bg-ink-100 dark:bg-ink-800'
              )}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-semibold shadow-soft">
                {(user?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold text-ink-900 dark:text-ink-100">
                  {user?.displayName || user?.username || 'Admin'}
                </span>
                <span className="text-[10px] text-ink-500 dark:text-ink-400">
                  {stats.count} data
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-ink-500" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl card shadow-soft-lg animate-scale-in p-2 origin-top-right z-30">
                <div className="px-3 py-2.5 border-b border-ink-200/70 dark:border-ink-800/70 mb-1">
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    {user?.email || 'admin@debttracker.app'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                    navigate('/login');
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
