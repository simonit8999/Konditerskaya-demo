import { describe, expect, it } from 'vitest';
import {
  PHONE_PLACEHOLDER,
  formatPhone,
  isPhoneComplete,
  normalizePhone,
  onlyDigits,
} from '@/utils/phone';

describe('phone mask', () => {
  it('форматирует полный номер в маску +7 (999) 123-45-67', () => {
    expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
    expect(formatPhone('+7 999 123 45 67')).toBe('+7 (999) 123-45-67');
    expect(formatPhone('9991234567')).toBe('+7 (999) 123-45-67');
  });

  it('достраивает маску по мере ввода', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('9')).toBe('+7 (9');
    expect(formatPhone('999')).toBe('+7 (999)');
    expect(formatPhone('9991')).toBe('+7 (999) 1');
  });

  it('отбрасывает лишние символы и ограничивает длину', () => {
    expect(formatPhone('abc')).toBe('');
    expect(formatPhone('+7 (999) 123-45-67 доб. 5')).toBe('+7 (999) 123-45-67');
    expect(onlyDigits('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('проверяет полноту номера', () => {
    expect(isPhoneComplete('+7 (999) 123-45-67')).toBe(true);
    expect(isPhoneComplete('+7 (999) 123-45')).toBe(false);
    expect(isPhoneComplete('')).toBe(false);
  });

  it('нормализует номер для API', () => {
    expect(normalizePhone('8 999 123 45 67')).toBe('+79991234567');
    expect(normalizePhone('999 123 45 67')).toBe('+79991234567');
  });

  it('отдаёт подсказку-плейсхолдер для пустого поля', () => {
    expect(PHONE_PLACEHOLDER).toBe('+7 (___) ___-__-__');
  });
});
