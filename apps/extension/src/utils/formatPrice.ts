/**
 * Форматирование цены в рублях: 6620 -> "6 620 ₽".
 * Ручная реализация (вместо Intl) — предсказуемый неразрывный пробел
 * и стабильный результат в тестах.
 */
export function formatPrice(value: number): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  const sign = rounded < 0 ? '−' : '';
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `${sign}${digits}\u00A0₽`;
}

/** Число с разделителями разрядов, без валюты. */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

/** Склонение: 1 порция / 2 порции / 5 порций. */
export function pluralize(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
