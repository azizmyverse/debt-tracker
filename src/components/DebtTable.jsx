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
  ChevronDown,
  Plus,
  Wallet,
  Copy,
} from 'lucide-react';
import { formatRupiah, formatDateID, daysUntil } from '../utils/format.js';
import { cn } from '../utils/cn.js';
import EmptyState from './ui/EmptyState.jsx';

const PAGE_SIZE = 7;
const GROUP_PAGE_SIZE = 6;

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

const GROUP_SORTS = [
  { key: 'total', label: 'Total Hutang' },
  { key: 'name', label: 'Nama' },
  { key: 'count', label: 'Jumlah Hutang' },
];

export default function DebtTable({
  debts,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddForName,
  onCopyGroup,
  query,
  statusFilter,
  grouped = false,
}) {
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

  if (grouped) {
    return (
      <GroupedView
        items={filtered}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        onAddForName={onAddForName}
        onCopyGroup={onCopyGroup}
      />
    );
  }

  return (
    <FlatTable
      items={filtered}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleStatus={onToggleStatus}
    />
  );
}

function FlatTable({ items, onEdit, onDelete, onToggleStatus }) {
  const [sort, setSort] = useState({ key: 'dueDate', dir: 'asc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...items];
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
  }, [items, sort]);

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

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={sorted.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

function GroupedView({
  items,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddForName,
  onCopyGroup,
}) {
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const [openMap, setOpenMap] = useState({});
  const [page, setPage] = useState(1);

  const groups = useMemo(() => {
    const map = new Map();
    for (const d of items) {
      const key = d.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: d.name.trim(),
          debts: [],
          total: 0,
          unpaidTotal: 0,
          countPaid: 0,
          countUnpaid: 0,
          countOverdue: 0,
          earliestDue: null,
        });
      }
      const g = map.get(key);
      g.debts.push(d);
      g.total += Number(d.amount) || 0;
      if (d.status === 'lunas') {
        g.countPaid += 1;
      } else {
        g.countUnpaid += 1;
        g.unpaidTotal += Number(d.amount) || 0;
        const days = daysUntil(d.dueDate);
        if (days !== null && days < 0) g.countOverdue += 1;
      }
      const dueT = new Date(d.dueDate).getTime();
      if (!g.earliestDue || dueT < g.earliestDue) g.earliestDue = dueT;
    }
    const arr = Array.from(map.values());
    for (const g of arr) {
      g.debts.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    }
    return arr;
  }, [items]);

  const sorted = useMemo(() => {
    const list = [...groups];
    list.sort((a, b) => {
      let av;
      let bv;
      if (sortKey === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === 'count') {
        av = a.debts.length;
        bv = b.debts.length;
      } else {
        av = a.total;
        bv = b.total;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [groups, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / GROUP_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (safePage - 1) * GROUP_PAGE_SIZE,
    safePage * GROUP_PAGE_SIZE
  );

  const toggleOpen = (key) => {
    setOpenMap((m) => ({ ...m, [key]: !(m[key] ?? true) }));
  };

  const setSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          <span className="font-semibold text-ink-700 dark:text-ink-200">
            {groups.length}
          </span>{' '}
          orang ·{' '}
          <span className="font-semibold text-ink-700 dark:text-ink-200">
            {items.length}
          </span>{' '}
          hutang
        </p>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-ink-500 dark:text-ink-400 mr-1">Urutkan:</span>
          {GROUP_SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition-colors',
                sortKey === s.key
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
              )}
            >
              {s.label}
              {sortKey === s.key &&
                (sortDir === 'asc' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                ))}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {pageItems.map((g) => (
          <Group
            key={g.key}
            group={g}
            open={openMap[g.key] ?? true}
            onToggle={() => toggleOpen(g.key)}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onAddForName={onAddForName}
            onCopyGroup={onCopyGroup}
          />
        ))}
      </div>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={sorted.length}
        pageSize={GROUP_PAGE_SIZE}
        unitLabel="orang"
        onChange={setPage}
      />
    </div>
  );
}

function Group({
  group,
  open,
  onToggle,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddForName,
  onCopyGroup,
}) {
  return (
    <div className="rounded-2xl border border-ink-200/70 dark:border-ink-800/70 bg-white dark:bg-ink-900/40 overflow-hidden transition-shadow hover:shadow-soft">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-ink-50/70 dark:hover:bg-ink-900/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-500/20 to-fuchsia-500/20 text-brand-600 dark:text-brand-300 font-display font-semibold flex items-center justify-center">
            {group.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-ink-900 dark:text-ink-100 truncate">
              {group.name}
            </div>
            <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                {group.debts.length} hutang
                {group.countPaid > 0 && ` · ${group.countPaid} lunas`}
                {group.countUnpaid > 0 && ` · ${group.countUnpaid} belum`}
              </span>
              {group.countOverdue > 0 && (
                <span className="badge-danger">
                  <CalendarClock className="h-3 w-3" />
                  {group.countOverdue} overdue
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-sm font-bold tabular-nums text-ink-900 dark:text-ink-50">
              {formatRupiah(group.total)}
            </div>
            {group.unpaidTotal !== group.total && group.unpaidTotal > 0 && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 tabular-nums">
                {formatRupiah(group.unpaidTotal)} belum lunas
              </div>
            )}
          </div>
          {onCopyGroup && (
            <span
              role="button"
              tabIndex={0}
              title={`Copy daftar hutang ${group.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onCopyGroup(group);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopyGroup(group);
                }
              }}
              className="rounded-lg p-2 text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-5 w-5 text-ink-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-ink-200/70 dark:border-ink-800/70 bg-ink-50/40 dark:bg-ink-950/30 animate-slide-up">
          <ul className="divide-y divide-ink-200/70 dark:divide-ink-800/70">
            {group.debts.map((d) => (
              <DebtSubRow
                key={d.id}
                debt={d}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </ul>
          {onAddForName && (
            <button
              onClick={() => onAddForName(group.name)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors border-t border-ink-200/70 dark:border-ink-800/70"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah hutang untuk {group.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DebtSubRow({ debt, onEdit, onDelete, onToggleStatus }) {
  const days = daysUntil(debt.dueDate);
  const overdue = debt.status !== 'lunas' && days !== null && days < 0;
  const dueSoon =
    debt.status !== 'lunas' && days !== null && days >= 0 && days <= 7;

  return (
    <li className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/70 dark:hover:bg-ink-900/40">
      <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
        <div className="min-w-[120px]">
          <div className="text-sm font-medium text-ink-800 dark:text-ink-100">
            {debt.bank}
          </div>
          {debt.note && (
            <div className="text-xs text-ink-500 dark:text-ink-400 truncate max-w-[240px]">
              {debt.note}
            </div>
          )}
        </div>
        <div className="text-sm font-semibold tabular-nums text-ink-900 dark:text-ink-50 min-w-[110px]">
          {formatRupiah(debt.amount)}
        </div>
        <div className="text-xs text-ink-500 dark:text-ink-400 inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatDateID(debt.dueDate)}
        </div>
        {debt.status === 'lunas' ? (
          <span className="badge-success">
            <Check className="h-3 w-3" /> Lunas
          </span>
        ) : (
          <span className="badge-warning">Belum</span>
        )}
        {overdue && (
          <span className="badge-danger">
            <CalendarClock className="h-3 w-3" />
            {Math.abs(days)} hari lewat
          </span>
        )}
        {dueSoon && (
          <span className="badge-warning">
            {days === 0 ? 'Hari ini' : `${days} hari lagi`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onToggleStatus(debt.id)}
          title={
            debt.status === 'lunas' ? 'Tandai belum lunas' : 'Tandai lunas'
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
    </li>
  );
}

function Pagination({ page, totalPages, total, pageSize, onChange, unitLabel = 'data' }) {
  if (totalPages <= 1) {
    return (
      <div className="mt-4 px-1">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Menampilkan{' '}
          <span className="font-semibold text-ink-700 dark:text-ink-200">
            {total}
          </span>{' '}
          {unitLabel}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <p className="text-xs text-ink-500 dark:text-ink-400">
        Menampilkan{' '}
        <span className="font-semibold text-ink-700 dark:text-ink-200">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
        </span>{' '}
        dari{' '}
        <span className="font-semibold text-ink-700 dark:text-ink-200">
          {total}
        </span>{' '}
        {unitLabel}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className="btn-secondary px-3 py-2"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              'h-9 min-w-9 rounded-xl text-sm font-medium transition-all',
              n === page
                ? 'bg-brand-600 text-white shadow-soft'
                : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
            )}
          >
            {n}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className="btn-secondary px-3 py-2"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
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
