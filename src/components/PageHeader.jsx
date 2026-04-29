export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
