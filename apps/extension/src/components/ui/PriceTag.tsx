import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';

interface PriceTagProps {
  value: number;
  className?: string;
}

/** Цена с анимацией «прокрутки» цифр при изменении состава. */
export function PriceTag({ value, className }: PriceTagProps) {
  return (
    <span className={cn('inline-flex overflow-hidden tabular-nums', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="block whitespace-nowrap"
        >
          {formatPrice(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
