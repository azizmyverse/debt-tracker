import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Trash2,
  RefreshCcw,
  User,
  Mail,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn.js';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { clearAll, resetSeed, stats } = useDebts();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleThemeSelect = (value) => {
    if (value === 'system') {
      setTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    } else {
      setTheme(value);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Sesuaikan tampilan, kelola data, dan keamanan akun."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-2 animate-slide-up">
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">
            Tampilan
          </h3>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            Pilih tema yang paling nyaman untuk matamu.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <ThemeOption
              value="light"
              icon={Sun}
              label="Light"
              active={theme}
              onSelect={handleThemeSelect}
            />
            <ThemeOption
              value="dark"
              icon={Moon}
              label="Dark"
              active={theme}
              onSelect={handleThemeSelect}
            />
            <ThemeOption
              value="system"
              icon={Monitor}
              label="System"
              active={theme}
              onSelect={handleThemeSelect}
            />
          </div>
        </div>

        <div className="card p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">
            Akun
          </h3>
          <div className="mt-3 space-y-2.5 text-sm">
            <Row icon={User} label="Username" value={user?.username || '-'} />
            <Row icon={Mail} label="Email" value={user?.email || '-'} />
            <Row
              icon={ShieldCheck}
              label="Sesi"
              value={
                user?.loggedAt
                  ? new Date(user.loggedAt).toLocaleString('id-ID')
                  : '-'
              }
            />
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn-secondary mt-4 w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/30"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>

        <div className="card p-6 lg:col-span-3 animate-slide-up">
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">
            Manajemen Data
          </h3>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            Total {stats.count} catatan disimpan secara lokal di browser kamu.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setConfirmReset(true)}
              className="btn-secondary justify-start gap-3 py-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <RefreshCcw className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="font-semibold">Reset ke Data Demo</span>
                <span className="text-xs font-normal text-ink-500 dark:text-ink-400">
                  Mengembalikan data contoh awal
                </span>
              </span>
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              className="btn-secondary justify-start gap-3 py-3 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                <Trash2 className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="font-semibold">Hapus Semua Data</span>
                <span className="text-xs font-normal text-ink-500 dark:text-ink-400">
                  Tindakan permanen pada localStorage
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          toast.error('Data dihapus', 'Seluruh hutang telah dihapus.');
        }}
        title="Hapus semua data hutang?"
        description="Tindakan ini akan menghapus semua catatan dan tidak dapat dikembalikan."
        confirmLabel="Ya, hapus semua"
      />

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetSeed();
          toast.success('Data direset', 'Data demo telah dikembalikan.');
        }}
        title="Reset ke data demo?"
        description="Data saat ini akan diganti dengan data contoh."
        confirmLabel="Ya, reset"
        variant="warning"
      />
    </div>
  );
}

function ThemeOption({ value, icon: Icon, label, active, onSelect }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:-translate-y-0.5',
        isActive
          ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10'
          : 'border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-medium text-ink-900 dark:text-ink-100 truncate">
        {value}
      </span>
    </div>
  );
}
