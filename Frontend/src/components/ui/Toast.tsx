// src/components/ui/Toast.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Biến lưu callback tĩnh để gọi toast ở ngoài React component (như httpClient.ts)
let globalAddToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = {
  success: (msg: string, duration = 3000) => globalAddToast?.(msg, 'success', duration),
  error: (msg: string, duration = 4000) => globalAddToast?.(msg, 'error', duration),
  info: (msg: string, duration = 3000) => globalAddToast?.(msg, 'info', duration),
  warning: (msg: string, duration = 3500) => globalAddToast?.(msg, 'warning', duration),
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Gán callback cho static helper
  globalAddToast = addToast;

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: '#10B981', border: '#059669', icon: '✓' };
      case 'error':
        return { bg: '#EF4444', border: '#DC2626', icon: '✕' };
      case 'warning':
        return { bg: '#F59E0B', border: '#D97706', icon: '⚠' };
      case 'info':
      default:
        return { bg: '#3B82F6', border: '#2563EB', icon: 'ℹ' };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const { bg, border, icon } = getToastColors(t.type);
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: '#ffffff',
                borderLeft: `5px solid ${border}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out',
                color: '#1F2937',
                fontSize: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: bg,
                    color: '#ffffff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </span>
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
