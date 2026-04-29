import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { cn } from '../utils/cn.js';

const COLLAPSE_KEY = 'dt_sidebar_collapsed';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-48 -left-32 h-[480px] w-[480px] rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark [background-size:24px_24px] opacity-40" />
      </div>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggle}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'transition-[padding] duration-300',
          collapsed ? 'lg:pl-[78px]' : 'lg:pl-64'
        )}
      >
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
