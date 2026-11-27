import { describe, expect, it } from 'vitest';
import { buildOgMeta, parseShopParam, sanitizeShopName } from '@/utils/og';

const BASE_INPUT = {
  siteName: 'Кондитерский Рай',
  siteUrl: 'https://example.github.io/candys-paradise/',
  imageUrl: 'https://example.github.io/candys-paradise/og-image.png',
  fallbackTitle: 'Ваше собственное приложение для кондитерской',
  description: 'Соберите свой торт онлайн за 2 минуты.',
};

describe('sanitizeShopName', () => {
  it('схлопывает пробелы и обрезает края', () => {
    expect(sanitizeShopName('  Тортик   на   Ленина ')).toBe('Тортик на Ленина');
  });

  it('вырезает HTML-скобки и кавычки', () => {
    expect(sanitizeShopName('<script>"Тортик"</script>')).toBe('script Тортик /script');
  });

  it('обрезает длинные названия до 40 символов', () => {
    const long = 'Т'.repeat(60);
    expect(sanitizeShopName(long)).toHaveLength(40);
  });

  it('пустая строка превращается в null', () => {
    expect(sanitizeShopName('   ')).toBeNull();
    expect(sanitizeShopName(null)).toBeNull();
  });
});

describe('parseShopParam', () => {
  it('читает shop из обычной query-строки', () => {
    expect(parseShopParam('?shop=Тортик', '')).toBe('Тортик');
  });

  it('читает shop из hash-роутера (#/?shop=…)', () => {
    expect(parseShopParam('', '#/?shop=Сладкий%20дом')).toBe('Сладкий дом');
  });

  it('декодирует плюсы как пробелы', () => {
    expect(parseShopParam('?shop=Сладкий+дом')).toBe('Сладкий дом');
  });

  it('без параметра возвращает null', () => {
    expect(parseShopParam('', '#/admin')).toBeNull();
    expect(parseShopParam('', '')).toBeNull();
    expect(parseShopParam('?admin=1')).toBeNull();
  });

  it('отбрасывает пустое или небезопасное значение', () => {
    expect(parseShopParam('?shop=%20%20')).toBeNull();
    expect(parseShopParam('?shop=<b>Тортик</b>')).toBe('b Тортик /b');
  });

  it('предпочитает обычную query-строку hash-параметру', () => {
    expect(parseShopParam('?shop=Первый', '#/?shop=Второй')).toBe('Первый');
  });
});

describe('buildOgMeta', () => {
  it('персонализирует заголовок, картинку и адрес', () => {
    const meta = buildOgMeta({ ...BASE_INPUT, shop: 'Тортик' });

    expect(meta.title).toBe('Приложение для «Тортик»');
    expect(meta.description).toBe(BASE_INPUT.description);
    expect(meta.image).toBe(BASE_INPUT.imageUrl);
    expect(meta.imageAlt).toBe('Приложение для кондитерской «Тортик»');
    expect(meta.url).toBe('https://example.github.io/candys-paradise/?shop=%D0%A2%D0%BE%D1%80%D1%82%D0%B8%D0%BA');
  });

  it('без названия возвращает общее превью', () => {
    const meta = buildOgMeta({ ...BASE_INPUT, shop: null });

    expect(meta.title).toBe(BASE_INPUT.fallbackTitle);
    expect(meta.url).toBe('https://example.github.io/candys-paradise/');
    expect(meta.imageAlt).toContain('Кондитерский Рай');
  });

  it('дописывает слэш в адрес сайта и картинку по умолчанию', () => {
    const meta = buildOgMeta({
      ...BASE_INPUT,
      siteUrl: 'https://example.github.io/candys-paradise',
      imageUrl: '',
      shop: null,
    });

    expect(meta.url).toBe('https://example.github.io/candys-paradise/');
    expect(meta.image).toBe('https://example.github.io/candys-paradise/og-image.png');
  });
});
