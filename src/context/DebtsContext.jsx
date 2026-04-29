import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SEED_DEBTS } from '../data/seed.js';

const DebtsContext = createContext(null);

const STORAGE_KEY = 'dt_debts_v1';
const SEED_FLAG = 'dt_seeded_v1';

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const loadInitial = () => {
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

export const DebtsProvider = ({ children }) => {
  const [debts, setDebts] = useState(loadInitial);
  // Simulate the loading skeleton on first paint.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
    } catch {
      // ignore
    }
  }, [debts]);

  const addDebt = useCallback((data) => {
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
    return debt;
  }, []);

  const updateDebt = useCallback((id, patch) => {
    setDebts((d) =>
      d.map((it) =>
        it.id === id
          ? {
              ...it,
              ...patch,
              amount:
                patch.amount !== undefined ? Number(patch.amount) : it.amount,
            }
          : it
      )
    );
  }, []);

  const deleteDebt = useCallback((id) => {
    setDebts((d) => d.filter((it) => it.id !== id));
  }, []);

  const toggleStatus = useCallback((id) => {
    setDebts((d) =>
      d.map((it) =>
        it.id === id
          ? { ...it, status: it.status === 'lunas' ? 'belum' : 'lunas' }
          : it
      )
    );
  }, []);

  const clearAll = useCallback(() => setDebts([]), []);

  const resetSeed = useCallback(() => {
    setDebts(SEED_DEBTS);
  }, []);

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
