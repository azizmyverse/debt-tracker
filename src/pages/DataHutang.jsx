import { useState } from 'react';
import { Plus, Search, Filter, Users, List } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DebtTable from '../components/DebtTable.jsx';
import DebtForm from '../components/DebtForm.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { SkeletonRow } from '../components/ui/Skeleton.jsx';
import { useDebts } from '../context/DebtsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { cn } from '../utils/cn.js';

export default function DataHutang() {
  const { debts, loading, addDebt, updateDebt, deleteDebt, toggleStatus } =
    useDebts();
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [grouped, setGrouped] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('dt_view_mode');
    return saved ? saved === 'grouped' : true;
  });

  const toggleGrouped = (next) => {
    setGrouped(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dt_view_mode', next ? 'grouped' : 'flat');
    }
  };

  const openAddForName = (name) => {
    setEditing({ name, isPrefill: true });
    setFormOpen(true);
  };

  const handleSubmit = (data) => {
    if (editing && !editing.isPrefill) {
      updateDebt(editing.id, data);
      toast.success('Hutang diperbarui', `${data.name} berhasil disimpan.`);
    } else {
      addDebt(data);
      toast.success('Hutang ditambahkan', `${data.name} masuk ke daftar.`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!confirm) return;
    deleteDebt(confirm.id);
    toast.error('Hutang dihapus', `${confirm.name} dihapus dari daftar.`);
  };

  const handleToggle = (id) => {
    const target = debts.find((d) => d.id === id);
    toggleStatus(id);
    if (target) {
      const next = target.status === 'lunas' ? 'belum lunas' : 'lunas';
      toast.success('Status diperbarui', `${target.name} ditandai ${next}.`);
    }
  };

  const counts = {
    all: debts.length,
    belum: debts.filter((d) => d.status === 'belum').length,
    lunas: debts.filter((d) => d.status === 'lunas').length,
  };

  return (
    <div>
      <PageHeader
        title="Data Hutang"
        description="Kelola seluruh catatan hutang dengan pencarian, sortir, dan filter."
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Tambah Hutang
          </button>
        }
      />

      <div className="card p-4 sm:p-5 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Cari nama, bank, atau catatan…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-ink-400 ml-1" />
            <FilterBtn
              value="all"
              label="Semua"
              count={counts.all}
              active={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterBtn
              value="belum"
              label="Belum Lunas"
              count={counts.belum}
              active={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterBtn
              value="lunas"
              label="Lunas"
              count={counts.lunas}
              active={statusFilter}
              onChange={setStatusFilter}
            />
            <div className="ml-1 inline-flex items-center rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-0.5">
              <button
                onClick={() => toggleGrouped(true)}
                title="Group by Nama"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  grouped
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Per Orang
              </button>
              <button
                onClick={() => toggleGrouped(false)}
                title="Tampilan tabel"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  !grouped
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700'
                )}
              >
                <List className="h-3.5 w-3.5" />
                Tabel
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-1">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : (
            <DebtTable
              debts={debts}
              query={query}
              statusFilter={statusFilter}
              grouped={grouped}
              onEdit={(d) => {
                setEditing(d);
                setFormOpen(true);
              }}
              onDelete={(d) => setConfirm(d)}
              onToggleStatus={handleToggle}
              onAddForName={openAddForName}
            />
          )}
        </div>
      </div>

      <DebtForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title={`Hapus hutang ${confirm?.name || ''}?`}
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}

function FilterBtn({ value, label, count, active, onChange }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-brand-600 text-white shadow-soft'
          : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700'
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-200'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
