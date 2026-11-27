/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый путь сборки (GitHub Pages). */
  readonly VITE_BASE_PATH?: string;
  /** Адрес API приёма заказов. Пусто -> демо-режим. */
  readonly VITE_ORDER_API_URL?: string;
  /** Канонический адрес сайта для OG-тегов и демо-страниц (со слэшем на конце). */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
