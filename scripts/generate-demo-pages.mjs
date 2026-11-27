/**
 * Статические «шлюзы» для персональных превью.
 *
 * Telegram, WhatsApp, VK и Slack не выполняют JavaScript — они читают только
 * исходный HTML. Поэтому для каждого демо-магазина генерируется обычная
 * страница `public/d/<slug>/index.html` с настоящими `og:*`-тегами:
 *
 *   https://<site>/d/tortik/  →  превью «Приложение для «Тортик»»
 *                             →  редирект в приложение с `?shop=Тортик`
 *
 * `public/` копируется в `dist` при сборке, поэтому файлы попадают в релиз
 * автоматически. Список магазинов — `apps/references/demo-shops.json`.
 *
 * Запуск: npm run demo:pages
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(REPO_ROOT, 'apps', 'references', 'demo-shops.json');
const OUTPUT_ROOT = resolve(REPO_ROOT, 'apps', 'extension', 'public', 'd');

const DEFAULT_SITE_URL = 'https://example.github.io/candys-paradise/';
const SITE_URL = `${(process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '')}/`;
const IMAGE_URL = `${SITE_URL}og-image.png`;
const IMAGE_ALT = 'Кондитерский Рай — конструктор тортов для кондитерских';

if (!process.env.VITE_SITE_URL) {
  console.warn(
    `demo:pages — VITE_SITE_URL не задан, подставляю заглушку ${DEFAULT_SITE_URL}\n` +
      '            для рабочих превью задайте канонический адрес сайта.',
  );
}

const DEFAULT_DESCRIPTION =
  'Соберите свой торт онлайн за 2 минуты: конструктор, автоматический расчёт цены и заявка в Telegram.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\s+/g, ' ');
}

function renderPage(shop, defaults) {
  const slug = String(shop.slug ?? '').trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Некорректный slug «${shop.slug}»: нужны латиница, цифры и дефис`);
  }

  const name = String(shop.shop ?? '').trim();
  if (!name) throw new Error(`Не задано название кондитерской для slug «${slug}»`);

  const title = `Приложение для «${name}»`;
  const description = String(shop.description ?? '').trim() || defaults.description;
  const pageUrl = `${SITE_URL}d/${slug}/`;
  const appPath = `../../?shop=${encodeURIComponent(name)}#/`;
  const city = String(shop.city ?? '').trim();

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} · ${escapeHtml(defaults.siteName)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(pageUrl)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(defaults.siteName)}" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${escapeAttr(IMAGE_URL)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeAttr(IMAGE_ALT)}" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(IMAGE_URL)}" />

    <meta http-equiv="refresh" content="0; url=${escapeAttr(appPath)}" />
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        background-color: #fff8e1;
        background-image: radial-gradient(circle at 15% -10%, rgba(255, 209, 220, 0.35), transparent 45%),
          radial-gradient(circle at 85% 0%, rgba(224, 242, 241, 0.45), transparent 40%);
        color: #5a3a3a;
        font-family: 'Open Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
      }
      main { max-width: 30rem; padding: 2rem; text-align: center; }
      h1 { font-size: 1.35rem; margin: 0 0 0.75rem; }
      p { margin: 0.25rem 0; color: rgba(51, 51, 51, 0.7); font-size: 0.95rem; }
      a {
        display: inline-block;
        margin-top: 1.5rem;
        padding: 0.75rem 1.6rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #daa520 0%, #c68e17 100%);
        color: #3e2723;
        font-weight: 600;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>Открываем демо-витрину${city ? ` для кондитерской в ${escapeHtml(city)}` : ''}…</p>
      <p>Если переход не произошёл автоматически — нажмите кнопку ниже.</p>
      <a href="${escapeAttr(appPath)}">Открыть приложение</a>
    </main>
    <script>window.location.replace(${JSON.stringify(appPath)});</script>
  </body>
</html>
`;

  return { slug, html };
}

const raw = await readFile(CONFIG_PATH, 'utf8');
const config = JSON.parse(raw);

const defaults = {
  siteName: String(config.siteName ?? 'Кондитерский Рай').trim(),
  description: String(config.defaultDescription ?? DEFAULT_DESCRIPTION).trim(),
};
const shops = Array.isArray(config) ? config : (config.shops ?? []);

if (shops.length === 0) {
  console.warn('demo:pages — список магазинов пуст, шлюзы не созданы');
} else {
  // Пересобираем каталог целиком: удалённые из JSON шлюзы не должны оставаться.
  await rm(OUTPUT_ROOT, { recursive: true, force: true });

  const created = [];
  for (const shop of shops) {
    const page = renderPage(shop, defaults);
    const directory = resolve(OUTPUT_ROOT, page.slug);

    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), page.html, 'utf8');
    created.push(page.slug);
  }

  console.log(`demo:pages — создано шлюзов: ${created.length}`);
  for (const slug of created) console.log(`  ${SITE_URL}d/${slug}/`);
}
