# Кондитерский Рай · Candys Paradise

PWA-витрина с конструктором тортов для кондитерских (B2B). Клиент сам собирает торт,
цена считается автоматически, а заявка приходит кондитеру в Telegram.

Демо-режим включён по умолчанию: цены, контакты и адрес — плейсхолдеры, заказы
сохраняются на устройстве и в Telegram не уходят (пока не подключён `apps/api`).

## Содержание

- [Стек](#стек)
- [Структура](#структура)
- [Быстрый старт](#быстрый-старт)
- [Где менять контент и цены](#где-менять-контент-и-цены)
- [Интеграция с Telegram](#интеграция-с-telegram)
- [PWA: манифест, service worker, офлайн](#pwa-манифест-service-worker-офлайн)
- [Деплой на GitHub Pages](#деплой-на-github-pages)
- [Скрипты](#скрипты)
- [Дизайн-токены](#дизайн-токены)
- [Ассеты: фото и иконки](#ассеты-фото-и-иконки)
- [Ограничения демо-версии](#ограничения-демо-версии)

## Стек

| Слой | Технологии |
|---|---|
| UI | React 19, TypeScript 5, Tailwind CSS 3.4, Framer Motion 12 |
| Сборка | Vite 6 (base-путь для GitHub Pages, code-splitting по страницам) |
| Роутинг | react-router-dom 7, `HashRouter` (работает на подпапке GH Pages и офлайн) |
| Состояние | React Context + `useReducer`-стиль, персист в `localStorage` |
| Тесты | Vitest (расчёт цены, маска телефона, даты, описание состава) |
| PWA | ручной `service-worker.js`, `manifest.json`, установка и авто-обновление |
| API | `apps/api` — `node:http` без зависимостей, Telegram Bot API |
| Ассеты | `sharp` (dev) для WebP, собственный генератор PNG-иконок без зависимостей |

## Структура

```
.
├─ apps/
│  ├─ extension/                 # PWA (React + Vite)
│  │  ├─ public/                 # manifest.json, service-worker.js, offline.html, icons/
│  │  └─ src/
│  │     ├─ assets/gallery/      # оптимизированные WebP + карта ассетов
│  │     ├─ components/          # layout, ui, cake, home, cart, checkout, pwa
│  │     ├─ context/             # Cart, Orders, Toast
│  │     ├─ hooks/               # useCakeBuilder, useLocalStorage, useInstallPrompt…
│  │     ├─ pages/               # Home, Builder, Cart, Checkout, Dashboard, статические
│  │     ├─ references/          # cakeData.json + siteContent.json (источник данных)
│  │     ├─ services/            # ordersService (Telegram/демо), pwaService, telegramMessage
│  │     ├─ styles/index.css     # Tailwind-слои, базовые стили, утилиты
│  │     ├─ types/               # доменные типы (CakeConfig, Order, SiteContent…)
│  │     └─ utils/               # цена, телефон, даты, валидация checkout + тесты
│  ├─ api/                       # заглушка API: POST /api/send-order -> Telegram
│  └─ references/                # README-заглушка под будущие статические артефакты
├─ scripts/
│  ├─ generate-icons.mjs         # PNG-иконки PWA (без зависимостей)
│  ├─ optimize-images.mjs        # JPG -> WebP 800w/400w (sharp)
│  ├─ smoke-api.mjs              # проверка /health и POST заказа
│  └─ smoke-preview.mjs          # проверка собранной PWA через vite preview
├─ docs/design-spec.md           # палитра, типографика, анимации, контент
├─ assets-source/photos/         # исходные JPG (после npm run images)
└─ .github/workflows/deploy.yml  # сборка и публикация на GitHub Pages
```

## Быстрый старт

Требования: Node.js ≥ 20.19, npm ≥ 10.

```bash
npm install
npm run dev          # PWA: http://localhost:5173
npm run dev:api      # (опционально) заглушка API: http://localhost:8787
```

> **Windows / PowerShell.** Политика выполнения может блокировать `npm.ps1`.
> Используйте `npm.cmd run dev` или `cmd /c "npm run dev"`.

Проверка качества:

```bash
npm run typecheck    # tsc --noEmit для приложения и конфигов
npm run test         # 19 unit-тестов (цена, маска, даты, состав)
npm run build        # production-сборка в apps/extension/dist
node scripts/smoke-preview.mjs   # поднимает preview и проверяет PWA-файлы
node scripts/smoke-api.mjs       # требует запущенный npm run dev:api
```

## Где менять контент и цены

| Что | Файл |
|---|---|
| Вес, основы, начинки, кремы, декор, правила цен | `apps/extension/src/references/cakeData.json` |
| Тексты лендинга, галерея, контакты, доставка, политика ПД | `apps/extension/src/references/siteContent.json` |
| Контакты в подвале и на странице контактов | `siteContent.json` → `contacts` |
| Условия доставки и слоты времени | `siteContent.json` → `delivery` |

**Формула цены** (`src/utils/priceCalculator.ts`):

```
size.basePrice
+ round(size.multiplier × (основа + начинка + крем))
+ Σ цена декора
+ надпись (если текст не пустой)
→ округление до 10 ₽
```

Пример: 2 кг + медовик + фруктовая + сырный + ягоды и кремовый декор + надпись = **7 100 ₽**
(покрыто тестом `priceCalculator.test.ts`).

Чтобы добавить вариант, допишите объект в нужный массив `cakeData.json`
(обязательны `id`, `label`, цены и `palette` для превью). Код менять не нужно.

## Интеграция с Telegram

Схема: **PWA → `POST /api/send-order` → `apps/api` → Telegram Bot API**.

1. Создайте бота у [@BotFather](https://t.me/BotFather), получите токен.
2. Узнайте `chat_id` кондитера (`https://api.telegram.org/bot<TOKEN>/getUpdates`).
3. `apps/api/.env` (копия `.env.example`):

   ```
   TELEGRAM_BOT_TOKEN=123456:AA...
   TELEGRAM_CHAT_ID=-1001234567890
   PORT=8787
   ALLOWED_ORIGIN=*
   ```

4. `apps/extension/.env.local`:

   ```
   VITE_ORDER_API_URL=/api/send-order
   ```

5. `npm run dev:api` + `npm run dev`.

Матрица поведения:

| `VITE_ORDER_API_URL` | Telegram-токен | Что происходит |
|---|---|---|
| пусто | — | **демо-режим**: заказ сохраняется локально, отправка имитируется |
| `/api/send-order` | не задан | API печатает заказ в консоль, клиент ставит статус «демо» |
| `/api/send-order` | задан | заказ уходит в Telegram, статус «отправлен» |
| `/api/send-order` | задан, но API недоступен | статус «не удалось», в кабинете есть «Отправить повторно» |

В продакшене токен живёт только на сервере: статический GitHub Pages его не хранит.
`apps/api` разворачивается на Node-хостинге, либо переносите `formatOrder.mjs` и
`telegram.mjs` в serverless-функцию (пример в комментарии `apps/api/src/server.mjs`).

## PWA: манифест, service worker, офлайн

- `apps/extension/public/manifest.json` — `start_url`/`scope: "./"`, `display: standalone`,
  `theme_color`/`background_color: #FFF8E1`, иконки 192/512 + maskable, shortcuts
  («Собрать торт», «Мои заказы», «Доставка»).
- `apps/extension/public/service-worker.js`:
  - **precache** — `index.html`, `offline.html`, `manifest.json`, иконки;
  - **навигация** — network-first → кэш `index.html` → `offline.html`;
  - **статика** (js/css/шрифты/WebP) — stale-while-revalidate;
  - `/api/*` и кросс-доменные запросы не кэшируются;
  - сообщение `SKIP_WAITING` активирует новую версию (кнопка «Обновить» в тосте).
- Регистрация — `src/services/pwaService.ts`, только в production-сборке
  (в dev SW отключён, чтобы не мешал HMR). При изменении логики кэша поднимайте
  `CACHE_VERSION` в начале `service-worker.js`.

Как проверить: DevTools → **Application** → Manifest / Service Workers;
поставьте **Offline** и перезагрузите — приложение должно открыться из кэша,
корзина и заказы остаться на месте. Установка: иконка «Установить» в шапке
(появляется, когда браузер разрешил промпт) или Lighthouse → PWA.

## Деплой на GitHub Pages

1. Запушьте проект в репозиторий (ветка `main`).
2. **Один раз** включите Pages: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**. Без этого шаг `Configure Pages` падает с ошибкой
   `Get Pages site failed... Not Found`. Автоматически включить Pages из workflow
   нельзя: для создания Pages-сайта нужен PAT или GitHub App token, а
   `GITHUB_TOKEN` таких прав не имеет. Для приватного репозитория на бесплатном
   плане GitHub Pages недоступны — репозиторий должен быть публичным.
3. Дальше каждый push в `main` запускает `.github/workflows/deploy.yml`:
   `npm ci` → `typecheck` → `test` → `build` (с `VITE_BASE_PATH=/<имя-репозитория>/`)
   → публикация `apps/extension/dist`.
4. Витрина: `https://<user>.github.io/<repo>/`.

Локальная проверка «как на проде»:

```powershell
$env:VITE_BASE_PATH="/candys-paradise/"
npm run build
npm run preview   # http://localhost:4173/candys-paradise/
```

Кастомный домен: соберите с `VITE_BASE_PATH="/"` и добавьте `CNAME`.
`HashRouter` выбран специально: GitHub Pages не умеет SPA-fallback, а хэш-роутинг
работает и на подпапке, и при офлайн-навигации.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер PWA (5173), проксирует `/api` на 8787 |
| `npm run dev:api` | заглушка API (8787), `--watch` |
| `npm run build` | production-сборка PWA в `apps/extension/dist` |
| `npm run preview` | локальный просмотр собранной PWA (4173) |
| `npm run typecheck` | `tsc --noEmit` для приложения и конфигов |
| `npm run test` | unit-тесты Vitest |
| `npm run icons` | генерация PNG-иконок PWA |
| `npm run images` | JPG → WebP 800w/400w |
| `node scripts/smoke-api.mjs` | `/health` + POST заказа в API |
| `node scripts/smoke-preview.mjs` | поднимает preview и проверяет PWA-файлы |

## Дизайн-токены

| Токен | HEX | Роль |
|---|---|---|
| `cream` | `#FFF8E1` | фон приложения, `theme_color` |
| `cream-50` | `#FFFDF6` | карточки, поля |
| `blush` | `#FFD1DC` | декоративные пятна, бейджи |
| `mint` | `#E0F2F1` | спокойные блоки (доставка, преимущества) |
| `gold` | `#DAA520` | основной CTA (градиент с `caramel`) |
| `caramel` | `#C68E17` | hover, акценты, итоговая сумма |
| `berry` | `#DC143C` | бейдж корзины, второстепенные акценты, ошибки |
| `ink` | `#333333` | основной текст |
| `cocoa` | `#5A3A3A` | заголовки, текст на золоте |

Шрифты: **Playfair Display** (600/700, `font-display`) для заголовков и итоговой суммы,
**Open Sans** (400/600, `font-sans`) для текста и кнопок. Self-hosted через
`@fontsource` (кириллица + латиница), поэтому шрифты работают офлайн.

Полная спецификация (иконки, сетки, анимации, тексты) — `docs/design-spec.md`.

## Ассеты: фото и иконки

- Исходные JPG лежат в `assets-source/photos/` (переносятся туда автоматически).
- `npm run images` создаёт `src/assets/gallery/<slug>.webp` (800w) и `<slug>-400.webp`
  для `srcSet`, суммарно ≈ 730 KB на 18 файлов.
- Чтобы добавить работу: положите JPG в `assets-source/photos/`, добавьте запись
  в массив `PHOTOS` (`scripts/optimize-images.mjs`), затем опишите её в
  `siteContent.gallery.items` (`slug`, `alt`, `caption`, `tag`, `objectPosition`).
- `npm run icons` рисует PNG-иконки PWA (192/512/maskable/180/32) без сторонних
  зависимостей — замените на дизайнерские, просто перезаписав файлы в `public/icons/`.

## Ограничения демо-версии

- **Нет авторизации:** «Мои заказы» — это `localStorage` текущего браузера,
  заказы не синхронизируются между устройствами.
- **Нет оплаты:** только статус «оплата при получении».
- **Контакты, адрес и цены — плейсхолдеры** (`siteContent.json`, `cakeData.json`).
- **Telegram** работает только при запущенном `apps/api` с токеном бота;
  на статическом GitHub Pages включён демо-режим.
- **Фотографии** — реальные работы кондитерской; на одном кадре есть водяной знак
  (`@grisha_kryt`) — его стоит заменить чистым файлом.
- Репозиторий готов к загрузке; после первого push один раз включите
  **Settings → Pages → Source: GitHub Actions** (подробнее выше). `node_modules`
  и `dist` в индекс не попадают (см. `.gitignore`).

