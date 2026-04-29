import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  description = 'Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-center gap-4 py-2">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Pastikan kamu sudah yakin sebelum melanjutkan.
        </p>
      </div>
    </Modal>
  );
}
