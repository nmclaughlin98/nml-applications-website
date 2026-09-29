import { useEffect } from 'react';

export function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;

    const timeout = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div
      className={`toast-notification ${message ? 'show' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!message}
    >
      {message && <span>{message}</span>}
    </div>
  );
}
