import { useState } from 'react';
import { CalendarDays, Building2, User, FileText, Wallet } from 'lucide-react';
import {
  formatNumberID,
  parseRupiahInput,
  isoToday,
} from '../utils/format.js';
import { BANKS } from '../data/seed.js';
import Modal from './ui/Modal.jsx';

const DEFAULT_BANK = BANKS[0];

const buildInitial = (initial) =>
  initial
    ? {
        name: initial.name || '',
        bank: initial.bank || DEFAULT_BANK,
        amount: initial.amount ? formatNumberID(initial.amount) : '',
        dueDate: initial.dueDate || isoToday(),
        status: initial.status || 'belum',
        note: initial.note || '',
      }
    : {
        name: '',
        bank: DEFAULT_BANK,
        amount: '',
        dueDate: isoToday(),
        status: 'belum',
        note: '',
      };

export default function DebtForm({ open, onClose, onSubmit, initial }) {
  if (!open) return null;
  return (
    <DebtFormInner
      key={initial?.id || (initial?.isPrefill ? `prefill-${initial.name}` : 'new')}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      initial={initial}
    />
  );
}

function DebtFormInner({ open, onClose, onSubmit, initial }) {
  const isEdit = !!initial && !initial.isPrefill;
  const [form, setForm] = useState(() => buildInitial(initial));
  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleAmountChange = (e) => {
    const num = parseRupiahInput(e.target.value);
    update('amount', num ? formatNumberID(num) : '');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi.';
    if (!form.bank.trim()) e.bank = 'Bank wajib diisi.';
    const amount = parseRupiahInput(form.amount);
    if (!amount || amount <= 0) e.amount = 'Nominal harus lebih dari 0.';
    if (!form.dueDate) e.dueDate = 'Tanggal jatuh tempo wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      bank: form.bank.trim(),
      amount: parseRupiahInput(form.amount),
      dueDate: form.dueDate,
      status: form.status,
      note: form.note,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Edit Hutang' : 'Tambah Hutang'}
      description={
        isEdit
          ? 'Perbarui detail hutang sesuai kebutuhan.'
          : initial?.isPrefill
            ? `Catat hutang baru untuk ${initial.name}.`
            : 'Catat hutang baru untuk dipantau di dashboard.'
      }
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Hutang'}
          </button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Field
          label="Nama"
          icon={User}
          error={errors.name}
          full
        >
          <input
            type="text"
            placeholder="cth. Andi Wijaya"
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Nama Bank" icon={Building2} error={errors.bank}>
          <div className="relative">
            <input
              type="text"
              list="bank-suggestions"
              placeholder="cth. BCA"
              className="input"
              value={form.bank}
              onChange={(e) => update('bank', e.target.value)}
            />
            <datalist id="bank-suggestions">
              {BANKS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
        </Field>

        <Field label="Status" icon={Wallet}>
          <select
            className="input"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value="belum">Belum Lunas</option>
            <option value="lunas">Lunas</option>
          </select>
        </Field>

        <Field
          label="Nominal Hutang"
          icon={Wallet}
          error={errors.amount}
          full
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500 dark:text-ink-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="input pl-10 tabular-nums"
              value={form.amount}
              onChange={handleAmountChange}
            />
          </div>
        </Field>

        <Field
          label="Jatuh Tempo (DD/MM/YYYY)"
          icon={CalendarDays}
          error={errors.dueDate}
          full
        >
          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
          />
        </Field>

        <Field label="Catatan" icon={FileText} full>
          <textarea
            rows={2}
            className="input resize-none"
            placeholder="Opsional…"
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}

function Field({ label, icon: Icon, error, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
