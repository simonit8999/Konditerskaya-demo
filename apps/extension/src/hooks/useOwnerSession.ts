import { useCallback, useState } from 'react';
import { businessSettings } from '@/references';

const SESSION_KEY = 'candys-paradise.owner-session.v1';

function readSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Демо-сессия владельца: PIN из business.json, хранение в sessionStorage.
 *
 * Это НЕ настоящая авторизация: любой, у кого есть доступ к браузеру,
 * может открыть devtools. Настоящая роль/JWT появится вместе с БД
 * (см. docs/database-schema.md, таблица business_settings и RLS).
 */
export function useOwnerSession() {
  const [isOwner, setIsOwner] = useState(readSession);

  const login = useCallback((pin: string): boolean => {
    const ok = pin.trim() === businessSettings.owner.pin;
    if (!ok) return false;

    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Приватный режим — сессия живёт только в памяти вкладки.
    }
    setIsOwner(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ничего страшного: состояние всё равно сбросим.
    }
    setIsOwner(false);
  }, []);

  return { isOwner, login, logout, owner: businessSettings.owner };
}
