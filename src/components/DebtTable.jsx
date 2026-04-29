import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from 'lucide-react';
import { formatRupiah, formatDateID, daysUntil } from '../utils/format.js';
import { cn } from '../utils/cn.js';
import EmptyState from './ui/EmptyState.jsx';
import { Wallet } from 'lucide-react';

const PAGE_SIZE = 7;

const COLS = [
  { key: 'name', label: 'Nama', sortable: true, className: 'min-w-[180px]' },
  { key: 'bank', label: 'Bank', sortable: true },
  {
    key: 'amount',
    label: 'Nominal',
    sortable: true,
    align: 'right',
    className: 'tabular-nums',
  },
  { key: 'dueDate', label: 'Jatuh Tempo', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '', sortable: false, align: 'right' },
];

export default function DebtTable({
  debts,
  onEdit,
  onDelete,
  onToggleStatus,
  query,
  statusFilter,
}) {
  const [sort, setSort] = useState({ key: 'dueDate', dir: 'asc' });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = debts;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.bank.toLowerCase().includes(q) ||
          (d.note || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter);
    }
    return list;
  }, [debts, query, statusFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const { key, dir } = sort;
    list.sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === 'amount') {
        av = Number(av);
        bv = Number(bv);
      } else if (key === 'dueDate') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sort.key !== key)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sort.dir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-brand-500" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-brand-500" />
    );
  };

  if (debts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Belum ada data hutang"
        description="Mulai tambahkan data hutang pertamamu untuk melihat dashboard ini hidup."
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="Tidak ada hasil"
        description="Coba ubah kata kunci pencarian atau filter status."
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="overflow-x-auto rounded-2xl border border-ink-200/70 dark:border-ink-800/70">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/70 dark:bg-ink-900/40">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 whitespace-nowrap',
                    c.align === 'right' && 'text-right',
                    c.className
                  )}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-ink-900 dark:hover:text-ink-100 transition-colors',
                        c.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      {c.label}
                      {sortIcon(c.key)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/70 dark:divide-ink-800/70">
            {pageItems.map((d) => (
              <Row
                key={d.id}
                debt={d}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Menampilkan{' '}
          <span className="font-semibold text-ink-700 dark:text-ink-200">
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)}
          </span>{' '}
          dari{' '}
          <span className="font-semibold text-ink-700 dark:text-ink-200">
            {sorted.length}
          </span>{' '}
          data
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary px-3 py-2"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                'h-9 min-w-9 rounded-xl text-sm font-medium transition-all',
                n === safePage
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
              )}
            >
              {n}
            </button>
          ))}
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-secondary px-3 py-2"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ debt, onEdit, onDelete, onToggleStatus }) {
  const days = daysUntil(debt.dueDate);
  const overdue = debt.status !== 'lunas' && days !== null && days < 0;
  const dueSoon =
    debt.status !== 'lunas' && days !== null && days >= 0 && days <= 7;

  return (
    <tr className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-900/40">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-500/15 to-fuchsia-500/15 text-brand-600 dark:text-brand-300 font-semibold flex items-center justify-center">
            {debt.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-ink-900 dark:text-ink-100 truncate">
              {debt.name}
            </div>
            {debt.note && (
              <div className="text-xs text-ink-500 dark:text-ink-400 truncate max-w-[240px]">
                {debt.note}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-ink-700 dark:text-ink-200">{debt.bank}</td>
      <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-ink-900 dark:text-ink-100">
        {formatRupiah(debt.amount)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-ink-700 dark:text-ink-200">
            {formatDateID(debt.dueDate)}
          </span>
          {overdue && (
            <span className="badge-danger">
              <CalendarClock className="h-3 w-3" />
              {Math.abs(days)} hari lewat
            </span>
          )}
          {dueSoon && (
            <span className="badge-warning">
              <CalendarClock className="h-3 w-3" />
              {days === 0 ? 'Hari ini' : `${days} hari lagi`}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">
        {debt.status === 'lunas' ? (
          <span className="badge-success">
            <Check className="h-3 w-3" /> Lunas
          </span>
        ) : (
          <span className="badge-warning">Belum</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleStatus(debt.id)}
            title={
              debt.status === 'lunas'
                ? 'Tandai belum lunas'
                : 'Tandai lunas'
            }
            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(debt)}
            title="Edit"
            className="rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(debt)}
            title="Hapus"
            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
