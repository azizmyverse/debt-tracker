import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Logo from '../components/Logo.jsx';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const { user, login, hydrated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  if (hydrated && user) {
    const redirectTo = location.state?.from || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.warning('Lengkapi form', 'Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.ok) {
      toast.success('Selamat datang!', 'Login berhasil.');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } else {
      toast.error('Login gagal', res.error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-fuchsia-50 dark:from-ink-950 dark:via-ink-950 dark:to-brand-950" />
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-brand-500/30 dark:bg-brand-500/20 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-fuchsia-500/25 dark:bg-fuchsia-500/15 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark [background-size:24px_24px] opacity-40" />
      </div>

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute top-5 right-5 btn-ghost p-2.5 z-10"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="grid w-full max-w-5xl grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col gap-8 p-10 animate-fade-in">
          <Logo />
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/70 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 px-3 py-1 text-xs font-semibold ring-1 ring-brand-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Debt Tracker Premium
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-tight leading-tight">
              Kelola hutang dengan{' '}
              <span className="text-gradient">tenang & elegan</span>.
            </h1>
            <p className="mt-3 text-ink-600 dark:text-ink-300 max-w-md">
              Dashboard modern untuk memantau seluruh catatan hutang, jatuh tempo, dan tren bulanan dalam satu tempat.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
            {[
              'Pencatatan hutang dengan format Rupiah otomatis',
              'Analitik visual: tren bulanan & komposisi status',
              'Dark mode, animasi halus, dan responsif',
            ].map((s) => (
              <li key={s} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Right login card */}
        <div className="glass rounded-3xl shadow-soft-lg p-7 sm:p-9 animate-scale-in">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            Masuk ke Dashboard
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Gunakan akun admin untuk mengelola data hutang.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-ink-600 dark:text-ink-300 select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                Ingat saya
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Fitur demo', 'Reset password belum tersedia.');
                }}
                className="text-brand-600 dark:text-brand-300 font-semibold hover:underline"
              >
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi…
                </>
              ) : (
                <>Masuk</>
              )}
            </button>

            <div className="rounded-xl bg-ink-50 dark:bg-ink-900/60 border border-ink-200/70 dark:border-ink-800/70 p-3.5 text-xs text-ink-600 dark:text-ink-300">
              <p className="font-semibold text-ink-700 dark:text-ink-200">Demo credentials</p>
              <p className="mt-0.5">
                Username: <code className="font-mono">admin</code> · Password:{' '}
                <code className="font-mono">admin123</code>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
