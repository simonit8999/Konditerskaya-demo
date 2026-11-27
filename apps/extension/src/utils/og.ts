/**
 * Open Graph и персональные ссылки.
 *
 * Логика чистая (без DOM), чтобы её можно было покрыть тестами:
 *  - `parseShopParam` достаёт название кондитерской из `?shop=` — в обычной
 *    query-строке или в hash (`#/?shop=Тортик`), потому что роутер у нас HashRouter;
 *  - `buildOgMeta` собирает заголовок, описание, картинку и канонический адрес.
 *
 * Побочные эффекты (запись тегов в <head>) живут в `@/services/ogService`.
 */

/** Максимальная длина названия в превью: дальше Telegram обрезает строку. */
export const SHOP_PARAM_MAX_LENGTH = 40;

/** Убирает управляющие символы и HTML-скобки, схлопывает пробелы, обрезает длину. */
export function sanitizeShopName(value: string | null | undefined): string | null {
  if (!value) return null;

  const cleaned = value
    .replace(/[\u0000-\u001F\u007F<>"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SHOP_PARAM_MAX_LENGTH)
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Название кондитерской из адреса страницы.
 *
 * @param search `window.location.search` — например `?shop=Тортик`
 * @param hash   `window.location.hash`   — например `#/?shop=Тортик` или `#/admin`
 */
export function parseShopParam(search = '', hash = ''): string | null {
  const sources: string[] = [];

  if (search) sources.push(search.replace(/^\?/, ''));

  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex >= 0) sources.push(hash.slice(hashQueryIndex + 1));

  for (const source of sources) {
    if (!source) continue;

    try {
      const value = sanitizeShopName(new URLSearchParams(source).get('shop'));
      if (value) return value;
    } catch {
      // Битая query-строка не должна ломать запуск приложения.
    }
  }

  return null;
}

export interface OgMetaInput {
  /** Название кондитерской из ссылки; null — общее превью. */
  shop: string | null;
  siteName: string;
  /** Абсолютный адрес сайта с завершающим слэшем. */
  siteUrl: string;
  /** Абсолютный адрес картинки превью. */
  imageUrl: string;
  /** Заголовок без персонализации. */
  fallbackTitle: string;
  description: string;
}

export interface OgMeta {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
}

/** Заголовок и адрес превью: «Приложение для «Тортик»» либо общий вариант. */
export function buildOgMeta(input: OgMetaInput): OgMeta {
  const siteUrl = input.siteUrl.replace(/\/?$/, '/');
  const image = input.imageUrl || `${siteUrl}og-image.png`;
  const title = input.shop ? `Приложение для «${input.shop}»` : input.fallbackTitle;

  return {
    title,
    description: input.description,
    image,
    imageAlt: input.shop
      ? `Приложение для кондитерской «${input.shop}»`
      : `${input.siteName} — конструктор тортов для кондитерских`,
    url: input.shop ? `${siteUrl}?shop=${encodeURIComponent(input.shop)}` : siteUrl,
  };
}
