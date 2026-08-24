import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import './Toast.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onDismiss: (id: string) => void;
}

const TOAST_ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

function ToastItem({ id, message, type, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const el = document.getElementById(`toast-${id}`);
    if (el) {
      requestAnimationFrame(() => el.classList.add('toast--visible'));
    }
  }, [id]);

  return (
    <div
      id={`toast-${id}`}
      className={`toast toast--${type}`}
      role="alert"
    >
      <span className="toast__icon">{TOAST_ICONS[type]}</span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
