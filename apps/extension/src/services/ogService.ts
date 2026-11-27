import { buildOgMeta, parseShopParam } from '@/utils/og';

/**
 * Open Graph «на лету»: подставляет заголовок, описание и картинку превью
 * в зависимости от `?shop=` в адресе.
 *
 * Честное ограничение: Telegram, WhatsApp, VK и Slack не выполняют JavaScript —
 * они читают только исходный HTML. Поэтому для красивых превью в мессенджерах
 * есть статические шлюзы `/d/<slug>/` (см. `scripts/generate-demo-pages.mjs`),
 * а этот модуль отвечает за `document.title`, `og:*` для индексации и для
 * клиентов, которые всё-таки исполняют JS.
 */

const SITE_NAME = 'Кондитерский Рай';
const SITE_TAGLINE = 'конструктор тортов для кондитерских';
const FALLBACK_TITLE = 'Ваше собственное приложение для кондитерской';
const DESCRIPTION =
  'Соберите свой торт онлайн за 2 минуты: конструктор, автоматический расчёт цены и заявка в Telegram.';
const IMAGE_FILE = 'og-image.png';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
}

/**
 * Абсолютный адрес сайта с завершающим слэшем.
 * Учитывает подпапку GitHub Pages: `import.meta.env.BASE_URL` = `/candys-paradise/`.
 * `VITE_SITE_URL` позволяет задать канонический домен (кастомный или `*.github.io`).
 */
export function resolveSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  const fallback = `${window.location.origin}${import.meta.env.BASE_URL}`;
  return `${(configured || fallback).replace(/\/+$/, '')}/`;
}

/** Обновляет `<title>` и OG/Twitter-теги по текущему адресу страницы. */
export function applyOpenGraph(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const siteUrl = resolveSiteUrl();
  const shop = parseShopParam(window.location.search, window.location.hash);
  const meta = buildOgMeta({
    shop,
    siteName: SITE_NAME,
    siteUrl,
    imageUrl: `${siteUrl}${IMAGE_FILE}`,
    fallbackTitle: FALLBACK_TITLE,
    description: DESCRIPTION,
  });

  document.title = shop ? `${meta.title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;

  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'ru_RU');
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:image', meta.image);
  upsertMeta('property', 'og:image:alt', meta.imageAlt);
  upsertMeta('property', 'og:url', meta.url);

  upsertMeta('name', 'description', meta.description);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);
  upsertMeta('name', 'twitter:image', meta.image);

  upsertCanonical(meta.url);
}

/**
 * Совместимость со старыми ссылками: `?admin=1` открывает кабинет владельца,
 * как раньше, но уже через хэш-роутер (`#/admin`).
 */
export function redirectLegacyParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('admin')) return;

  params.delete('admin');
  const query = params.toString();
  window.location.replace(`${window.location.pathname}${query ? `?${query}` : ''}#/admin`);
}
