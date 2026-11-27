# apps/api — приём заказов и Telegram

Заглушка бэкенда на `node:http` без зависимостей. Нужна, чтобы заказ из PWA
уходил кондитеру в Telegram.

## Как это работает

1. Клиент собирает заказ в PWA и делает `POST /api/send-order`
   (в dev Vite проксирует `/api` на `http://localhost:8787`).
2. `src/server.mjs` читает тело, проверяет обязательные поля (`validateOrder`).
3. `src/formatOrder.mjs` собирает HTML-сообщение: позиции, состав, клиент, доставка, сумма.
4. `src/telegram.mjs` вызывает `https://api.telegram.org/bot<TOKEN>/sendMessage`.
5. Ответ: `{ ok: true, mode: "telegram" }` либо `{ ok: false, error }`.

Если `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` не заданы, сообщение печатается
в консоль и API отвечает `{ ok: true, mode: "log" }` — удобно для демо.

> Windows: чтобы кириллица в логах консоли читалась корректно, выполните
> `chcp 65001` в том же окне терминала перед `npm run dev:api`.

## Запуск

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev:api           # http://localhost:8787
npm run dev               # PWA: http://localhost:5173
```

В PWA создайте `apps/extension/.env.local`:

```
VITE_ORDER_API_URL=/api/send-order
```

Без этой переменной клиент работает в демо-режиме и заказы в Telegram не отправляет.

## Эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/health` | `{ ok: true, mode: "telegram" \| "log" }` |
| `POST` | `/api/send-order` | Принять заказ `Order` и отправить в Telegram |

Пример проверки:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8787/api/send-order `
  -ContentType 'application/json' `
  -Body '{"number":"КР-100001","items":[{"title":"Торт 2 кг","price":7100,"composition":["Вес: 2 кг"]}],"customer":{"name":"Демо","phone":"+79990000000"},"delivery":{"method":"pickup","date":"2026-12-01","timeSlot":"12:00–14:00"},"total":7100}'
```

## Будущие эндпоинты и БД

Сейчас API умеет только `/health` и `POST /api/send-order`. Целевая схема
PostgreSQL, RLS и план миграции localStorage описаны в
[`docs/database-schema.md`](../../docs/database-schema.md).

Планируемые маршруты:

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/api/orders` | Создание заказа, идемпотентно по `client_id` |
| `GET` | `/api/orders` | Список заказов владельца |
| `PATCH` | `/api/orders/:id/status` | Статус + событие истории + уведомление |
| `PATCH` | `/api/orders/:id/note` | Заметка владельца |
| `GET` | `/api/notifications` | Уведомления роли |
| `PATCH` | `/api/notifications/:id/read` | Отметка о прочтении |
| `POST` | `/api/owner/session` | Вход владельца, JWT |

Когда API появится, на клиенте включается `VITE_DATA_SOURCE=http` — страницы
переключатся с localStorage на HTTP-репозиторий без правок UI. До этого
`data/http/orderRepository.ts` остаётся заглушкой с понятной ошибкой.

`formatOrder.mjs` уже поддерживает комментарий на уровне заказа и
необязательный мессенджер клиента (кликабельная ссылка в Telegram).

## Продакшен

Токен бота нельзя хранить на GitHub Pages. Разворачивайте `apps/api` на любом
Node-хостинге (Railway, Render, VPS) или перенесите два модуля
(`formatOrder.mjs`, `telegram.mjs`) в serverless-функцию Vercel/Netlify/Cloudflare.
Пример serverless-хендлера есть в комментарии к `src/server.mjs`.

После деплоя укажите в PWA `VITE_ORDER_API_URL=https://api.<домен>/api/send-order`
и добавьте домен витрины в `ALLOWED_ORIGIN`.
