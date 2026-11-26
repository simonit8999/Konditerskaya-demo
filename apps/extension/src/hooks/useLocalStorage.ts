import { useCallback, useState } from 'react';

/**
 * Состояние с автоматическим сохранением в localStorage.
 * Используется для корзины и истории заказов: данные переживают перезагрузку
 * и доступны офлайн (важно для PWA).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prevValue: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Приватный режим или переполнение квоты — работаем только в памяти.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue] as const;
}
