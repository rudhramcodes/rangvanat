import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/store.js';

export default function ToastAlert() {
  const { toasts, removeToast } = useStore();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-20 right-6 z-80 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border border-[var(--line-khadi)] shadow-lg rounded-[2px] p-3.5 flex items-center justify-between gap-3 animate-fade-in"
          style={{
            borderLeft: `4px solid ${
              toast.type === 'success'
                ? 'var(--state-success)'
                : toast.type === 'error'
                ? 'var(--state-error)'
                : 'var(--brand-gold)'
            }`,
          }}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[var(--state-success)] flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={18} className="text-[var(--state-error)] flex-shrink-0" />
            ) : (
              <Info size={18} className="text-[var(--brand-gold)] flex-shrink-0" />
            )}
            <p className="text-[13.5px] font-medium text-[var(--ink-chocolate)] m-0 leading-tight">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] p-1 flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
