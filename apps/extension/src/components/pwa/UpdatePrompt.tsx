import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

/** Предложение обновиться, когда service worker скачал новую версию. */
export function UpdatePrompt() {
  const { available, apply } = useServiceWorkerUpdate();
  const [hidden, setHidden] = useState(false);

  const visible = available && !hidden;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-40 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-cream-50/95 px-4 py-3 shadow-soft backdrop-blur sm:bottom-6 sm:left-6 sm:mx-0"
          role="status"
        >
          <Icon name="sparkle" className="size-5 text-caramel" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cocoa">Доступна новая версия</p>
            <p className="text-xs text-ink/60">Обновите, чтобы получить свежие цены и декор.</p>
          </div>
          <button
            type="button"
            onClick={apply}
            className="rounded-full bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-cocoa-dark"
          >
            Обновить
          </button>
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Скрыть уведомление об обновлении"
            className="rounded-full p-1 text-ink/40 transition-colors hover:text-cocoa"
          >
            <Icon name="close" className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
