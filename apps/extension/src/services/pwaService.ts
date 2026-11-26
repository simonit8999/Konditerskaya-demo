/**
 * Регистрация service worker и обновление приложения.
 *
 * SW включается только в production-сборке: в dev-режиме кэш мешает hot reload.
 * Файл service-worker.js лежит в public/ и копируется в корень сборки,
 * поэтому путь относительный — работает и на GitHub Pages (/repo/).
 */

type UpdateListener = () => void;

const listeners = new Set<UpdateListener>();

export function onServiceWorkerUpdate(listener: UpdateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyUpdate() {
  listeners.forEach((listener) => listener());
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          notifyUpdate();
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            // Новый SW установлен, но старый ещё управляет страницей -> показываем баннер.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate();
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[PWA] Не удалось зарегистрировать service worker:', error);
      });
  });
}

/** Активирует ожидающий service worker и перезагружает страницу. */
export function applyServiceWorkerUpdate(): void {
  if (!('serviceWorker' in navigator)) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  });

  navigator.serviceWorker.getRegistration().then((registration) => {
    const waiting = registration?.waiting;
    if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
    else window.location.reload();
  });
}
