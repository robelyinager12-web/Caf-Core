import { create } from 'zustand';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastState {
  message: string | null;
  type: 'success' | 'error';
  show: (message: string, type?: 'success' | 'error') => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'success',
  show: (message, type = 'success') => set({ message, type }),
  hide: () => set({ message: null }),
}));

export function ToastContainer() {
  const { message, type, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 4000);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 text-success" />
      ) : (
        <XCircle className="h-5 w-5 text-danger" />
      )}
      <span className="text-sm text-gray-800 dark:text-gray-100">{message}</span>
      <button onClick={hide} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}