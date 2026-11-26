import { describe, expect, it } from 'vitest';
import { formatDateRu, formatDateShort, formatDateTimeRu, isDateAllowed, toISODate } from '@/utils/date';

const NOW = new Date(2026, 10, 26, 10, 0, 0); // 26 ноября 2026, 10:00

describe('date utils', () => {
  it('переводит дату в ISO без UTC-сдвига', () => {
    expect(toISODate(new Date(2026, 10, 5))).toBe('2026-11-05');
    expect(toISODate(new Date(2027, 0, 1))).toBe('2027-01-01');
  });

  it('разрешает даты не раньше срока изготовления (24 часа)', () => {
    expect(isDateAllowed('2026-11-27', 24, NOW)).toBe(true);
    expect(isDateAllowed('2026-12-01', 24, NOW)).toBe(true);
    expect(isDateAllowed('2026-11-26', 24, NOW)).toBe(false);
    expect(isDateAllowed('2026-11-25', 24, NOW)).toBe(false);
    expect(isDateAllowed('', 24, NOW)).toBe(false);
  });

  it('учитывает сложный декор с большим сроком (48 часов)', () => {
    expect(isDateAllowed('2026-11-27', 48, NOW)).toBe(false);
    expect(isDateAllowed('2026-11-28', 48, NOW)).toBe(true);
  });

  it('форматирует даты для интерфейса', () => {
    expect(formatDateRu('2026-11-27')).toMatch(/27/);
    expect(formatDateRu('2026-11-27')).toMatch(/ноябр/);
    expect(formatDateShort('2026-11-27T14:35:00')).toBe('27.11.2026');
    expect(formatDateTimeRu('2026-11-27T14:35:00')).toMatch(/14:35/);
  });
});
