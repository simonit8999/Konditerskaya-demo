/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый путь сборки (GitHub Pages). */
  readonly VITE_BASE_PATH?: string;
  /** Адрес API приёма заказов. Пусто -> демо-режим. */
  readonly VITE_ORDER_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
