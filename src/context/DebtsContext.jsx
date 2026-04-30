import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SEED_DEBTS } from '../data/seed.js';
import { debtsApi, supabaseEnabled } from '../lib/supabase.js';
import { useToast } from './ToastContext.jsx';

const DebtsContext = createContext(null);

const STORAGE_KEY = 'dt_debts_v1';
const SEED_FLAG = 'dt_seeded_v1';

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const loadLocal = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (!localStorage.getItem(SEED_FLAG)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DEBTS));
      localStorage.setItem(SEED_FLAG, '1');
      return SEED_DEBTS;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveLocal = (debts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
  } catch {
    // ignore
  }
};

export const DebtsProvider = ({ children }) => {
  const toast = useToast();
  const [debts, setDebts] = useState(() => (supabaseEnabled ? [] : loadLocal()));
  const [loading, setLoading] = useState(true);
  const [remoteError, setRemoteError] = useState(null);
  const [usingRemote, setUsingRemote] = useState(supabaseEnabled);
  const initRef = useRef(false);

  const refetchRemote = useCallback(async () => {
    try {
      const list = await debtsApi.list();
      setDebts(list);
    } catch (err) {
      console.error('Refetch failed:', err);
    }
  }, []);

  // Initial load: from Supabase if configured, else localStorage cache.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!supabaseEnabled) {
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      try {
        const list = await debtsApi.list();
        if (cancelled) return;
        if (list.length === 0) {
          // First-run on a fresh DB: seed it once.
          if (typeof window !== 'undefined' && !localStorage.getItem(SEED_FLAG)) {
            const seeded = SEED_DEBTS.map((d) => ({ ...d }));
            try {
              await debtsApi.bulkInsert(seeded);
              setDebts(seeded);
              localStorage.setItem(SEED_FLAG, '1');
            } catch (err) {
              console.error('Failed to seed Supabase:', err);
              setDebts([]);
            }
          } else {
            setDebts([]);
          }
        } else {
          setDebts(list);
        }
        setUsingRemote(true);
        setRemoteError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('Supabase fetch failed, falling back to localStorage:', err);
        setDebts(loadLocal());
        setUsingRemote(false);
        setRemoteError(err.message || 'Tidak dapat memuat data dari Supabase.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror to localStorage only when not using a remote DB (DB is source of truth).
  useEffect(() => {
    if (!loading && !usingRemote) saveLocal(debts);
  }, [debts, loading, usingRemote]);

  const addDebt = useCallback(
    async (data) => {
      const debt = {
        id: uid(),
        name: data.name.trim(),
        bank: data.bank.trim(),
        amount: Number(data.amount) || 0,
        dueDate: data.dueDate,
        status: data.status || 'belum',
        note: data.note?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      setDebts((d) => [debt, ...d]);
      if (usingRemote) {
        try {
          await debtsApi.insert(debt);
        } catch (err) {
          console.error('Supabase insert failed:', err);
          setDebts((d) => d.filter((x) => x.id !== debt.id));
          toast.error(
            'Gagal menyimpan ke database',
            err.message || 'Periksa Row Level Security policies di Supabase.'
          );
        }
      }
      return debt;
    },
    [usingRemote, toast]
  );

  const updateDebt = useCallback(
    async (id, patch) => {
      let prev = null;
      setDebts((d) => {
        const next = d.map((it) => {
          if (it.id !== id) return it;
          prev = it;
          return {
            ...it,
            ...patch,
            amount:
              patch.amount !== undefined ? Number(patch.amount) : it.amount,
          };
        });
        return next;
      });
      if (usingRemote) {
        try {
          await debtsApi.update(id, patch);
        } catch (err) {
          console.error('Supabase update failed:', err);
          if (prev) {
            setDebts((d) => d.map((it) => (it.id === id ? prev : it)));
          }
          toast.error('Gagal update database', err.message || 'Coba lagi.');
        }
      }
    },
    [usingRemote, toast]
  );

  const deleteDebt = useCallback(
    async (id) => {
      let removed = null;
      setDebts((d) => {
        removed = d.find((it) => it.id === id) || null;
        return d.filter((it) => it.id !== id);
      });
      if (usingRemote) {
        try {
          await debtsApi.remove(id);
        } catch (err) {
          console.error('Supabase delete failed:', err);
          if (removed) {
            setDebts((d) => [removed, ...d]);
          }
          toast.error('Gagal hapus dari database', err.message || 'Coba lagi.');
        }
      }
    },
    [usingRemote, toast]
  );

  const toggleStatus = useCallback(
    async (id) => {
      let nextStatus = null;
      let prevStatus = null;
      setDebts((d) =>
        d.map((it) => {
          if (it.id !== id) return it;
          prevStatus = it.status;
          nextStatus = it.status === 'lunas' ? 'belum' : 'lunas';
          return { ...it, status: nextStatus };
        })
      );
      if (usingRemote && nextStatus) {
        try {
          await debtsApi.update(id, { status: nextStatus });
        } catch (err) {
          console.error('Supabase toggle failed:', err);
          setDebts((d) =>
            d.map((it) => (it.id === id ? { ...it, status: prevStatus } : it))
          );
          toast.error('Gagal update status', err.message || 'Coba lagi.');
        }
      }
    },
    [usingRemote, toast]
  );

  const clearAll = useCallback(async () => {
    setDebts([]);
    if (usingRemote) {
      try {
        await debtsApi.clearAll();
      } catch (err) {
        console.error('Supabase clear failed:', err);
        toast.error('Gagal hapus data di database', err.message || 'Coba lagi.');
        await refetchRemote();
      }
    }
  }, [usingRemote, toast, refetchRemote]);

  const resetSeed = useCallback(async () => {
    const seeded = SEED_DEBTS.map((d) => ({ ...d, id: uid() }));
    setDebts(seeded);
    if (usingRemote) {
      try {
        await debtsApi.clearAll();
        await debtsApi.bulkInsert(seeded);
      } catch (err) {
        console.error('Supabase seed reset failed:', err);
        toast.error('Gagal reset data ke database', err.message || 'Coba lagi.');
        await refetchRemote();
      }
    }
  }, [usingRemote, toast, refetchRemote]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAll = 0;
    let totalUnpaid = 0;
    let totalPaid = 0;
    let countPaid = 0;
    let countUnpaid = 0;
    let countOverdue = 0;
    let totalOverdue = 0;

    for (const d of debts) {
      totalAll += d.amount;
      if (d.status === 'lunas') {
        totalPaid += d.amount;
        countPaid++;
      } else {
        totalUnpaid += d.amount;
        countUnpaid++;
        const due = new Date(d.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due <= today) {
          countOverdue++;
          totalOverdue += d.amount;
        }
      }
    }

    return {
      totalAll,
      totalUnpaid,
      totalPaid,
      countPaid,
      countUnpaid,
      countOverdue,
      totalOverdue,
      count: debts.length,
    };
  }, [debts]);

  const value = useMemo(
    () => ({
      debts,
      loading,
      stats,
      addDebt,
      updateDebt,
      deleteDebt,
      toggleStatus,
      clearAll,
      resetSeed,
      usingRemote,
      remoteError,
    }),
    [
      debts,
      loading,
      stats,
      addDebt,
      updateDebt,
      deleteDebt,
      toggleStatus,
      clearAll,
      resetSeed,
      usingRemote,
      remoteError,
    ]
  );

  return (
    <DebtsContext.Provider value={value}>{children}</DebtsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDebts = () => {
  const ctx = useContext(DebtsContext);
  if (!ctx) throw new Error('useDebts must be used within DebtsProvider');
  return ctx;
};
