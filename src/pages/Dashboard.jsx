import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Database,
  CalendarClock,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { StatSkeleton } from '../components/ui/Skeleton.jsx';
import {
  formatRupiah,
  formatDateID,
  daysUntil,
  monthLabelID,
} from '../utils/format.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Dashboard() {
  const { stats, debts, loading } = useDebts();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...debts]
      .filter((d) => d.status !== 'lunas')
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5);
  }, [debts]);

  const trendData = useMemo(() => {
    // Aggregate total debt amount per month over the last 6 months.
    const buckets = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.set(key, { label: monthLabelID(d), key, value: 0 });
    }
    debts.forEach((d) => {
      const dt = new Date(d.createdAt || d.dueDate);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (buckets.has(key)) {
        buckets.get(key).value += d.amount;
      }
    });
    return Array.from(buckets.values());
  }, [debts]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas hutang & status keuanganmu hari ini."
        actions={
          <>
            <button
              onClick={() => navigate('/analytics')}
              className="btn-secondary"
            >
              <ArrowUpRight className="h-4 w-4" /> Analytics
            </button>
            <button
              onClick={() => navigate('/data')}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" /> Tambah Hutang
            </button>
          </>
        }
      />

      {/* Hero highlight */}
      <div className="card card-hover relative overflow-hidden p-6 sm:p-8 mb-6 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/95 via-indigo-600/95 to-fuchsia-600/95" />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 text-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Total hutang aktif
            </div>
            <p className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight tabular-nums">
              <CountUpDisplay value={stats.totalUnpaid} />
            </p>
            <p className="mt-2 text-sm text-white/80">
              {stats.countUnpaid} hutang belum lunas dari total {stats.count} data
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill label="Lunas" value={`${stats.countPaid} data`} />
            <Pill label="Jatuh tempo" value={`${stats.countOverdue} data`} />
            <Pill label="Total seluruh" value={formatRupiah(stats.totalAll)} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Hutang"
            value={stats.totalAll}
            icon={Wallet}
            accent="brand"
            hint="Seluruh transaksi"
          />
          <StatCard
            label="Jumlah Data"
            value={stats.count}
            format="number"
            icon={Database}
            accent="indigo"
            hint={`${stats.countPaid} lunas • ${stats.countUnpaid} belum`}
          />
          <StatCard
            label="Hutang Jatuh Tempo"
            value={stats.totalOverdue}
            icon={CalendarClock}
            accent="rose"
            hint={`${stats.countOverdue} data overdue`}
          />
          <StatCard
            label="Hutang Lunas"
            value={stats.totalPaid}
            icon={CheckCircle2}
            accent="emerald"
            hint={`${stats.countPaid} data terselesaikan`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        {/* Trend chart */}
        <div className="card p-5 xl:col-span-2 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
                Tren Hutang 6 Bulan
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Akumulasi nominal per bulan berdasarkan tanggal pencatatan
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b62ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b62ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke={theme === 'dark' ? '#1c2438' : '#eef0f4'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: theme === 'dark' ? '#8b97aa' : '#5d6b80' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: theme === 'dark' ? '#8b97aa' : '#5d6b80' }}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(0)}jt`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}rb`
                        : v
                  }
                />
                <Tooltip
                  cursor={{ stroke: '#3b62ff', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 12px 32px -8px rgba(16,23,41,0.25)',
                    background: theme === 'dark' ? '#101729' : '#ffffff',
                    color: theme === 'dark' ? '#eef0f4' : '#101729',
                    fontSize: 12,
                  }}
                  formatter={(v) => [formatRupiah(v), 'Total']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b62ff"
                  strokeWidth={2.5}
                  fill="url(#trendGrad)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming */}
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
                Akan Jatuh Tempo
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                5 hutang terdekat
              </p>
            </div>
            <button
              onClick={() => navigate('/data')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          <div className="space-y-1">
            {upcoming.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-500 dark:text-ink-400">
                Tidak ada hutang yang menunggu jatuh tempo. 🎉
              </div>
            ) : (
              upcoming.map((d) => {
                const days = daysUntil(d.dueDate);
                const overdue = days < 0;
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">
                        {d.name}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">
                        {d.bank} • {formatDateID(d.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 tabular-nums">
                        {formatRupiah(d.amount)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          overdue
                            ? 'text-rose-600 dark:text-rose-400'
                            : days <= 7
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-ink-500'
                        }`}
                      >
                        {overdue
                          ? `${Math.abs(days)} hari lewat`
                          : days === 0
                            ? 'Hari ini'
                            : `${days} hari lagi`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CountUpDisplay({ value }) {
  // re-use dashboard-level animation by using StatCard? We'll just format here
  // The hero already uses an isolated value, so simple format is fine.
  return <span>{formatRupiah(value)}</span>;
}

function Pill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5 min-w-[140px]">
      <p className="text-[11px] uppercase tracking-wider text-white/70">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
