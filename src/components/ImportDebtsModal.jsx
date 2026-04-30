import { useMemo, useState } from 'react';
import { ClipboardPaste, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { parseImportText } from '../utils/parseImport.js';
import { formatRupiah, formatDateID } from '../utils/format.js';

const PLACEHOLDER = `MAS IS
| 25 hari lagi | Rp 526.000 | Bank Jago
| 41 hari lagi | Rp 218.000 | Allobank
| 56 hari lagi | Rp 526.000 | Bank Jago

ANDI WIJAYA
| Hari ini | Rp 1.200.000 | Kredivo
| 7 hari lewat | 850.000 | Akulaku`;

export default function ImportDebtsModal({ open, onClose, onImport }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { items, errors } = useMemo(() => parseImportText(text), [text]);

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText((prev) => (prev ? `${prev}\n${clip}` : clip));
    } catch {
      // ignored — user can paste manually with Ctrl+V
    }
  };

  const handleImport = async () => {
    if (!items.length || submitting) return;
    setSubmitting(true);
    try {
      await onImport(items);
      setText('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setText('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Hutang dari Teks"
      description="Tempel format hasil Copy untuk import banyak hutang sekaligus."
      size="xl"
      footer={
        <>
          <button onClick={handleClose} className="btn-secondary">
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!items.length || submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Mengimpor...'
              : `Import ${items.length || 0} hutang`}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
              Teks input
            </label>
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-300 hover:underline"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Tempel dari clipboard
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            rows={14}
            className="w-full rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-3.5 py-2.5 font-mono text-xs text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 leading-relaxed">
            Format: nama (huruf kapital atau biasa) di baris atas, lalu setiap
            hutang di baris berikutnya dengan format{' '}
            <code className="text-[11px] bg-ink-100 dark:bg-ink-800 px-1 rounded">
              | durasi | nominal | bank
            </code>
            . Durasi: <code>X hari lagi</code>, <code>X hari lewat</code>,{' '}
            <code>Hari ini</code>, atau <code>Lunas</code>.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
            Preview ({items.length})
          </label>
          <div className="mt-2 rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-950/40 max-h-[360px] overflow-y-auto">
            {items.length === 0 && errors.length === 0 && (
              <div className="text-center text-sm text-ink-400 dark:text-ink-500 py-12 px-4">
                Tempel teks di sebelah kiri untuk melihat preview
              </div>
            )}
            {items.length > 0 && (
              <ul className="divide-y divide-ink-200/70 dark:divide-ink-800/70">
                {items.map((it, i) => (
                  <li
                    key={i}
                    className="px-3.5 py-2.5 flex items-start gap-3 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold text-ink-900 dark:text-ink-50 truncate">
                        {it.name}
                      </div>
                      <div className="text-ink-500 dark:text-ink-400 mt-0.5 tabular-nums">
                        {formatRupiah(it.amount)} · {it.bank} ·{' '}
                        {formatDateID(it.dueDate)}
                        {it.status === 'lunas' && ' · Lunas'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {errors.length > 0 && (
              <div className="border-t border-ink-200/70 dark:border-ink-800/70 bg-rose-50/40 dark:bg-rose-500/5 p-3 space-y-2">
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {errors.length} baris dilewati
                </div>
                <ul className="text-[11px] text-rose-700/90 dark:text-rose-300/90 space-y-1">
                  {errors.slice(0, 6).map((e, i) => (
                    <li key={i}>
                      Baris {e.line}: {e.reason}
                    </li>
                  ))}
                  {errors.length > 6 && (
                    <li>… dan {errors.length - 6} baris lain</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
