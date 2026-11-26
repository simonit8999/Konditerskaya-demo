import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * Плавный переход между страницами: лёгкий fade + сдвиг по вертикали.
 * mode="wait" — сначала уходит старая страница, потом появляется новая.
 */
export function PageTransition() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
