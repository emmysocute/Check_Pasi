import { useState, useCallback } from 'react';

/**
 * Reusable hook for managing temporary toast notification messages
 * @param {number} defaultDuration Duration in ms before auto-dismiss (default: 3800ms)
 */
export function useToast(defaultDuration = 3800) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = defaultDuration) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, [defaultDuration]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export default useToast;
