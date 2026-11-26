import type { Order, SendOrderResult } from '@/types';
import { normalizePhone } from '@/utils/phone';

/**
 * Отправка заказа кондитеру.
 *
 * Демо-режим (VITE_ORDER_API_URL пустой):
 *   заказ сохраняется на устройстве, отправка имитируется — так работает
 *   статический деплой на GitHub Pages без бэкенда.
 *
 * Боевой режим (VITE_ORDER_API_URL = /api/send-order):
 *   POST { order } -> apps/api -> Telegram Bot API.
 */
const API_URL = (import.meta.env.VITE_ORDER_API_URL ?? '').trim();

export const isDemoMode = API_URL.length === 0;

const DEMO_DELAY_MS = 700;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function sendOrder(order: Order): Promise<SendOrderResult> {
  if (isDemoMode) {
    await delay(DEMO_DELAY_MS);
    return { ok: true, mode: 'demo' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        customer: { ...order.customer, phone: normalizePhone(order.customer.phone) },
      }),
    });

    if (!response.ok) {
      return { ok: false, mode: 'failed', error: `Сервер ответил ${response.status}` };
    }

    const data = (await response.json().catch(() => ({}))) as { mode?: string };
    return { ok: true, mode: data.mode === 'telegram' ? 'telegram' : 'log' };
  } catch (error) {
    return {
      ok: false,
      mode: 'failed',
      error: error instanceof Error ? error.message : 'Нет связи с сервером',
    };
  }
}
