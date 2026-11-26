/**
 * Генерация идентификаторов.
 * crypto.randomUUID доступен только в защищённом контексте (https/localhost),
 * поэтому предусмотрен запасной вариант — это важно для офлайн-режима и http-демо.
 */
export function createId(prefix = ''): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  const unique =
    typeof cryptoApi?.randomUUID === 'function'
      ? cryptoApi.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  return prefix ? `${prefix}_${unique}` : unique;
}

/** Человекочитаемый номер заказа: КР-482913. */
export function createOrderNumber(): string {
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `КР-${random}`;
}
