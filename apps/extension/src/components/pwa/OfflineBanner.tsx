import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

/** Полоса «нет соединения»: конструктор продолжает работать офлайн. */
export function OfflineBanner({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden bg-caramel/15 text-cocoa"
        >
          <div className="container-page flex items-start gap-2 py-2.5 text-xs font-semibold leading-relaxed">
            <Icon name="info" className="mt-0.5 size-4 shrink-0 text-caramel" />
            <span>
              Нет подключения. Конструктор работает — заказ сохранится на устройстве,
              а отправить его кондитеру можно из «Моих заказов», когда связь вернётся.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
