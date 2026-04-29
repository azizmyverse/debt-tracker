import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Belum ada data',
  description = 'Mulai dengan menambahkan data pertama kamu.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-br from-brand-500/30 via-fuchsia-400/20 to-transparent rounded-full" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 shadow-soft">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500 dark:text-ink-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
