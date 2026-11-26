import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const DISMISS_KEY = 'candys-paradise.install-dismissed';

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Баннер установки PWA (появляется, когда браузер разрешил нативный промпт). */
export function InstallPrompt() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(readDismissed);

  const visible = canInstall && !dismissed;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // приватный режим — просто скрываем на текущей сессии
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-3xl border border-line bg-cream-50/95 p-4 shadow-soft backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0 sm:w-[320px] lg:bottom-6"
          role="dialog"
          aria-label="Установка приложения"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-caramel">
              <Icon name="download" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base text-cocoa">Установите приложение</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                Заказывайте торт в один тап — витрина работает даже без интернета.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Скрыть предложение установки"
              className="-mr-1 -mt-1 rounded-full p-1 text-ink/40 transition-colors hover:text-cocoa"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void install()}
              className="flex-1 rounded-full bg-gold-gradient px-3 py-2 text-sm font-semibold text-cocoa-dark"
            >
              Установить
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink/60 transition-colors hover:bg-cream-200"
            >
              Позже
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
