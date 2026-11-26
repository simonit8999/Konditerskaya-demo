/**
 * Заглушка API «Кондитерского Рая».
 *
 *   GET  /health          -> статус и режим отправки
 *   POST /api/send-order  -> принять заказ и отправить в Telegram
 *
 * Запуск: npm run dev:api  (порт 8787, Vite проксирует /api)
 * Секреты: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в apps/api/.env
 *
 * В продакшене эту же логику (formatOrderMessage + sendTelegramMessage)
 * можно развернуть как serverless-функцию:
 *
 *   // api/send-order.js (Vercel)
 *   import { formatOrderMessage, validateOrder } from '../../../apps/api/src/formatOrder.mjs';
 *   import { sendTelegramMessage } from '../../../apps/api/src/telegram.mjs';
 *   export default async function handler(req, res) { ... }
 */
import { createServer } from 'node:http';
import { formatOrderMessage, validateOrder } from './formatOrder.mjs';
import { isTelegramConfigured, sendTelegramMessage } from './telegram.mjs';

const PORT = Number(process.env.PORT ?? 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';
const MAX_BODY_BYTES = 256 * 1024;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Тело запроса слишком большое'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true, mode: isTelegramConfigured() ? 'telegram' : 'log' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/send-order') {
    let order;

    try {
      const raw = await readBody(req);
      order = JSON.parse(raw);
    } catch (error) {
      sendJson(res, 400, { ok: false, error: 'Некорректный JSON' });
      return;
    }

    const validationError = validateOrder(order);
    if (validationError) {
      sendJson(res, 422, { ok: false, error: validationError });
      return;
    }

    const message = formatOrderMessage(order);
    const result = await sendTelegramMessage(message);

    if (!result.ok) {
      console.error('[send-order] Telegram:', result.reason);
      sendJson(res, 502, { ok: false, error: result.reason ?? 'Не удалось отправить заказ' });
      return;
    }

    console.log(
      `[send-order] ${order.number} · ${order.items.length} поз. · ${order.total} ₽ · mode=${result.mode}`,
    );
    sendJson(res, 200, { ok: true, mode: result.mode });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Не найдено' });
});

server.listen(PORT, () => {
  console.log(`API «Кондитерский Рай» слушает http://localhost:${PORT}`);
  console.log(`Режим Telegram: ${isTelegramConfigured() ? 'telegram' : 'log (токен не задан)'}`);
});
