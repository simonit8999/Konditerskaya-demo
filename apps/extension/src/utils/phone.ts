/**
 * Маска телефона: +7 (999) 123-45-67.
 * Работает без сторонних библиотек: ввод фильтруется до цифр,
 * форматирование накладывается на каждое изменение.
 */

export const PHONE_PLACEHOLDER = '+7 (___) ___-__-__';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatPhone(input: string): string {
  let digits = onlyDigits(input);
  if (!digits) return '';

  // 8 999 ... и 999 ... приводим к коду страны 7
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const rest = digits.slice(1);
  let result = '+7';

  if (rest.length > 0) result += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) result += ')';
  if (rest.length > 3) result += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) result += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) result += `-${rest.slice(8, 10)}`;

  return result;
}

/** Полный номер для проверки: 11 цифр, начиная с 7. */
export function isPhoneComplete(input: string): boolean {
  const digits = onlyDigits(input);
  return digits.length === 11 && digits.startsWith('7');
}

/** Нормализованный номер для API/Telegram: +79991234567. */
export function normalizePhone(input: string): string {
  let digits = onlyDigits(input);
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return input.trim();
}
