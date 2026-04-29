import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-ink-900/40 dark:bg-ink-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full surface rounded-2xl shadow-soft-lg animate-scale-in',
          sizeClass
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50 font-display">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-200/70 dark:border-ink-800/70 px-6 py-4 rounded-b-2xl bg-ink-50/40 dark:bg-ink-950/30">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
