/**
 * Работа с датами заказа.
 * Все даты — локальные (без UTC-сдвигов), формат хранения — "YYYY-MM-DD".
 */

const MS_PER_HOUR = 60 * 60 * 1000;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Дата в локальном формате YYYY-MM-DD (для input[type=date]). */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Минимально допустимая дата получения: сейчас + минимальный срок изготовления. */
export function minOrderDate(leadHours: number, now = new Date()): Date {
  return new Date(now.getTime() + leadHours * MS_PER_HOUR);
}

/** Разрешена ли дата: не раньше minOrderDate и не в прошлом. */
export function isDateAllowed(isoDate: string, leadHours: number, now = new Date()): boolean {
  if (!isoDate) return false;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return false;

  const selected = new Date(year, month - 1, day);
  const earliest = startOfDay(minOrderDate(leadHours, now));
  return selected.getTime() >= earliest.getTime();
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** "2026-11-27" -> "27 ноября 2026 г." */
export function formatDateRu(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return dateFormatter.format(new Date(year, month - 1, day));
}

/** ISO-датавремя -> "27 ноября, 14:35" */
export function formatDateTimeRu(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return dateTimeFormatter.format(parsed);
}

/** Короткая подпись "27.11.2026" для компактных карточек. */
export function formatDateShort(value: string): string {
  const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${pad(parsed.getDate())}.${pad(parsed.getMonth() + 1)}.${parsed.getFullYear()}`;
}
