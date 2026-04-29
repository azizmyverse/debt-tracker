import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error:
    'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  warning:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++counter.current;
      const t = {
        id,
        type: toast.type || 'info',
        title: toast.title || '',
        description: toast.description || '',
        duration: toast.duration ?? 3500,
      };
      setToasts((list) => [...list, t]);
      if (t.duration > 0) {
        setTimeout(() => dismiss(id), t.duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      toast: push,
      success: (title, description) => push({ type: 'success', title, description }),
      error: (title, description) => push({ type: 'error', title, description }),
      warning: (title, description) => push({ type: 'warning', title, description }),
      info: (title, description) => push({ type: 'info', title, description }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${STYLES[t.type]} bg-white/90 dark:bg-ink-900/90 backdrop-blur-md px-4 py-3 shadow-soft-lg animate-slide-in-right`}
            >
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                {t.title && (
                  <div className="font-semibold text-ink-900 dark:text-ink-100">
                    {t.title}
                  </div>
                )}
                {t.description && (
                  <div className="text-ink-600 dark:text-ink-300 mt-0.5">
                    {t.description}
                  </div>
                )}
              </div>
              <button
                aria-label="Dismiss"
                className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
                onClick={() => dismiss(t.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
