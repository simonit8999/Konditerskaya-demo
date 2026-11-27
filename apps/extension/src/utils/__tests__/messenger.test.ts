import { describe, expect, it } from 'vitest';
import { buildMaxLink, buildTelLink, buildTelegramLink } from '@/utils/messenger';

describe('buildTelegramLink', () => {
  it('собирает ссылку на профиль по нику', () => {
    expect(buildTelegramLink('@Piholaaa')).toBe('https://t.me/Piholaaa');
  });

  it('понимает полный адрес t.me и лишние слэши', () => {
    expect(buildTelegramLink('https://t.me/Piholaaa/')).toBe('https://t.me/Piholaaa');
  });

  it('подставляет черновик сообщения через ?text=', () => {
    const link = buildTelegramLink('@Piholaaa', 'Здравствуйте! Хочу такое приложение.');
    expect(link).toBe(`https://t.me/Piholaaa?text=${encodeURIComponent('Здравствуйте! Хочу такое приложение.')}`);
  });

  it('игнорирует пустой текст черновика', () => {
    expect(buildTelegramLink('@Piholaaa', '   ')).toBe('https://t.me/Piholaaa');
  });

  it('возвращает null без ника', () => {
    expect(buildTelegramLink('')).toBeNull();
    expect(buildTelegramLink('   ')).toBeNull();
  });
});

describe('buildMaxLink', () => {
  it('строит ссылку на профиль MAX по международному номеру', () => {
    expect(buildMaxLink('+7 920 404 58 80')).toBe('https://max.ru/u/+79204045880');
  });

  it('приводит 8… к коду страны 7', () => {
    expect(buildMaxLink('8 (920) 404-58-80')).toBe('https://max.ru/u/+79204045880');
  });

  it('дополняет десятизначный номер кодом 7', () => {
    expect(buildMaxLink('9204045880')).toBe('https://max.ru/u/+79204045880');
  });

  it('возвращает null, если цифр нет', () => {
    expect(buildMaxLink('позвоните мне')).toBeNull();
  });
});

describe('buildTelLink', () => {
  it('строит tel:-ссылку из форматированного номера', () => {
    expect(buildTelLink('+7 (920) 404-58-80')).toBe('tel:+79204045880');
  });

  it('возвращает null для пустой строки', () => {
    expect(buildTelLink('')).toBeNull();
  });
});
