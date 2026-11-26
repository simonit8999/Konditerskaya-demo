import { useCallback, useEffect, useState } from 'react';
import { applyServiceWorkerUpdate, onServiceWorkerUpdate } from '@/services/pwaService';

/**
 * Состояние обновления PWA: available -> показываем тост «Доступна новая версия».
 */
export function useServiceWorkerUpdate() {
  const [available, setAvailable] = useState(false);

  useEffect(() => onServiceWorkerUpdate(() => setAvailable(true)), []);

  const apply = useCallback(() => {
    applyServiceWorkerUpdate();
  }, []);

  return { available, apply };
}
