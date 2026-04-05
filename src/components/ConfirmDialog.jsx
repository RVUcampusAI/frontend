import { Button } from './FormParts';

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-elevated animate-scale-in">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <Button
            type="button"
            onClick={onConfirm}
            loading={loading}
            className={danger ? '!bg-danger hover:!bg-danger/90' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
