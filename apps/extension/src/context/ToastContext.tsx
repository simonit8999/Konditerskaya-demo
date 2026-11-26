import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { createId } from '@/utils/id';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-mint-deep/60 bg-cream-50',
  error: 'border-berry/40 bg-cream-50 text-berry-dark',
  info: 'border-line bg-cream-50',
};

const VARIANT_ICONS: Record<ToastVariant, 'check' | 'close' | 'sparkle'> = {
  success: 'check',
  error: 'close',
  info: 'sparkle',
};

const TOAST_TTL_MS = 3600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = createId('toast');
      // Держим не больше трёх сообщений одновременно.
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      timers.current.push(window.setTimeout(() => dismiss(id), TOAST_TTL_MS));
    },
    [dismiss],
  );

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-8"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm text-ink shadow-soft backdrop-blur',
                VARIANT_STYLES[toast.variant],
              )}
            >
              <Icon
                name={VARIANT_ICONS[toast.variant]}
                className={cn(
                  'mt-0.5 size-4',
                  toast.variant === 'error' ? 'text-berry' : 'text-caramel',
                )}
              />
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Закрыть уведомление"
                className="rounded-full p-1 text-ink/50 transition-colors hover:bg-cream-200 hover:text-cocoa"
              >
                <Icon name="close" className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
  return context;
}
