import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp.js';
import { formatRupiah, formatNumberID } from '../utils/format.js';
import { cn } from '../utils/cn.js';

export default function StatCard({
  label,
  value,
  format = 'currency', // 'currency' | 'number'
  icon: Icon,
  trend,
  trendLabel,
  accent = 'brand',
  hint,
}) {
  const animated = useCountUp(value);

  const formatted =
    format === 'currency' ? formatRupiah(animated) : formatNumberID(Math.round(animated));

  const accentMap = {
    brand: 'from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-300 ring-brand-500/20',
    emerald:
      'from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-300 ring-emerald-500/20',
    rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-300 ring-rose-500/20',
    amber:
      'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-300 ring-amber-500/20',
    indigo:
      'from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-300 ring-indigo-500/20',
  };

  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="card card-hover p-5 group relative overflow-hidden">
      <div
        className={cn(
          'absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-100',
          accentMap[accent]
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 tabular-nums truncate">
            {formatted}
          </p>
          {(hint || trend !== undefined) && (
            <div className="mt-3 flex items-center gap-2">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    trend >= 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(trend)}%
                </span>
              )}
              {(trendLabel || hint) && (
                <span className="text-xs text-ink-500 dark:text-ink-400">
                  {trendLabel || hint}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-1 bg-white dark:bg-ink-900 shadow-soft',
              accentMap[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
