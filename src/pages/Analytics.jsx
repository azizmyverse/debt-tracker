import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatRupiah, monthLabelID } from '../utils/format.js';
import EmptyState from '../components/ui/EmptyState.jsx';
import { BarChart3 } from 'lucide-react';

const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

export default function Analytics() {
  const { debts } = useDebts();
  const { theme } = useTheme();

  const monthly = useMemo(() => {
    const buckets = new Map();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.set(key, { label: monthLabelID(d), total: 0, lunas: 0, belum: 0 });
    }
    debts.forEach((d) => {
      const dt = new Date(d.createdAt || d.dueDate);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.total += d.amount;
        bucket[d.status] = (bucket[d.status] || 0) + d.amount;
      }
    });
    return Array.from(buckets.values());
  }, [debts]);

  const pieData = useMemo(() => {
    let lunas = 0,
      belum = 0,
      overdue = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    debts.forEach((d) => {
      if (d.status === 'lunas') lunas += d.amount;
      else {
        const due = new Date(d.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due <= today) overdue += d.amount;
        else belum += d.amount;
      }
    });
    return [
      { name: 'Lunas', value: lunas },
      { name: 'Jatuh Tempo', value: overdue },
      { name: 'Belum (On-track)', value: belum },
    ].filter((d) => d.value > 0);
  }, [debts]);

  const byBank = useMemo(() => {
    const map = new Map();
    debts.forEach((d) => {
      map.set(d.bank, (map.get(d.bank) || 0) + d.amount);
    });
    return Array.from(map.entries())
      .map(([bank, total]) => ({ bank, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [debts]);

  const tickColor = theme === 'dark' ? '#8b97aa' : '#5d6b80';
  const gridColor = theme === 'dark' ? '#1c2438' : '#eef0f4';
  const tooltipStyle = {
    borderRadius: 12,
    border: 'none',
    boxShadow: '0 12px 32px -8px rgba(16,23,41,0.25)',
    background: theme === 'dark' ? '#101729' : '#ffffff',
    color: theme === 'dark' ? '#eef0f4' : '#101729',
    fontSize: 12,
  };

  if (debts.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" description="Visualisasi tren & komposisi hutang." />
        <div className="card">
          <EmptyState
            icon={BarChart3}
            title="Belum ada data untuk dianalisis"
            description="Tambahkan minimal 1 hutang untuk melihat grafik."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Visualisasi tren & komposisi hutang dengan animasi smooth."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2 animate-slide-up">
          <ChartHeader
            title="Total Hutang per Bulan"
            subtitle="Akumulasi nominal hutang berdasarkan tanggal pencatatan"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b62ff" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(0)}jt`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}rb`
                        : v
                  }
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(16,23,41,0.04)' }}
                  contentStyle={tooltipStyle}
                  formatter={(v) => [formatRupiah(v), 'Total']}
                />
                <Bar
                  dataKey="total"
                  fill="url(#barGrad)"
                  radius={[10, 10, 4, 4]}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 animate-slide-up">
          <ChartHeader
            title="Komposisi Status"
            subtitle="Distribusi nominal berdasarkan status"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={900}
                  stroke={theme === 'dark' ? '#0b1224' : '#ffffff'}
                  strokeWidth={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => formatRupiah(v)}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: tickColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 xl:col-span-2 animate-slide-up">
          <ChartHeader
            title="Tren Lunas vs Belum"
            subtitle="Perbandingan nominal lunas vs belum lunas per bulan"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthly}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(0)}jt`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}rb`
                        : v
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => formatRupiah(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
                <Line
                  type="monotone"
                  dataKey="lunas"
                  name="Lunas"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  animationDuration={900}
                />
                <Line
                  type="monotone"
                  dataKey="belum"
                  name="Belum"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 animate-slide-up">
          <ChartHeader
            title="Top Bank"
            subtitle="Total nominal hutang per bank"
          />
          <div className="space-y-2.5 mt-3">
            {byBank.map((b) => {
              const max = byBank[0]?.total || 1;
              const pct = (b.total / max) * 100;
              return (
                <div key={b.bank}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700 dark:text-ink-200">
                      {b.bank}
                    </span>
                    <span className="tabular-nums text-ink-600 dark:text-ink-300">
                      {formatRupiah(b.total)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
        {title}
      </h3>
      <p className="text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>
    </div>
  );
}
