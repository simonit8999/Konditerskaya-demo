/**
 * Отправка сообщения в Telegram через Bot API.
 *
 * Токен и chat_id живут ТОЛЬКО на сервере (env), никогда — в клиенте:
 * статическая PWA не умеет хранить секреты.
 */

const TELEGRAM_API = 'https://api.telegram.org';

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * @param {string} text — сообщение в HTML-разметке Telegram
 * @returns {Promise<{ok: boolean, mode: 'telegram'|'log', reason?: string}>}
 */
export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Режим разработки: печатаем заказ в консоль, чтобы проверить формат.
    console.log('\n--- Telegram не настроен, сообщение для кондитера ---\n');
    console.log(text);
    console.log('\n--- конец сообщения ---\n');
    return { ok: true, mode: 'log' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        mode: 'telegram',
        reason: data.description ?? `Telegram ответил ${response.status}`,
      };
    }

    return { ok: true, mode: 'telegram' };
  } catch (error) {
    return {
      ok: false,
      mode: 'telegram',
      reason: error instanceof Error ? error.message : 'Сетевая ошибка Telegram API',
    };
  }
}
