import { cn } from '../utils/cn.js';

export default function Logo({ className, withText = true }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-500 to-fuchsia-500 shadow-glow">
        <div className="absolute inset-0 flex items-center justify-center font-display text-white text-lg font-bold">
          B
        </div>
      </div>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[15px] font-bold tracking-tight text-ink-900 dark:text-ink-50">
            BayarDebt
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400 dark:text-ink-500">
            Debt Tracker
          </span>
        </div>
      )}
    </div>
  );
}
