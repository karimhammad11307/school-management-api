import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ApiError } from '../api/client';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  messages: string[];
  statusCode?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string | string[], statusCode?: number) => void;
  showApiError: (error: unknown, fallbackTitle?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string | string[], statusCode?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      const messages = Array.isArray(message)
        ? message
        : message
        ? [message]
        : [];

      setToasts((prev) => [...prev, { id, type, title, messages, statusCode }]);

      setTimeout(() => {
        removeToast(id);
      }, 6000);
    },
    [removeToast],
  );

  const showApiError = useCallback(
    (err: unknown, fallbackTitle: string = 'Operation Failed') => {
      if (err instanceof ApiError) {
        showToast(
          'error',
          err.statusCode === 409 ? `Conflict Error (${err.statusCode})` : `${err.errorName} (${err.statusCode})`,
          err.messages,
          err.statusCode,
        );
      } else if (err instanceof Error) {
        showToast('error', fallbackTitle, err.message);
      } else {
        showToast('error', fallbackTitle, 'An unexpected error occurred');
      }
    },
    [showToast],
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast('success', title, message);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, showApiError, showSuccess, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-lg shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-2 ${
                isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{toast.title}</p>
                    {toast.statusCode && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
                          toast.statusCode === 409
                            ? 'bg-rose-200 text-rose-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {toast.statusCode}
                      </span>
                    )}
                  </div>
                  {toast.messages.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {toast.messages.map((msg, i) => (
                        <p key={i} className="text-xs leading-relaxed opacity-90 break-words">
                          {toast.messages.length > 1 ? `• ${msg}` : msg}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
