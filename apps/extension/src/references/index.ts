import type { BusinessSettings, CakeConfig, CakeData, SiteContent } from '@/types';
import businessJson from './business.json';
import cakeDataJson from './cakeData.json';
import siteContentJson from './siteContent.json';

/**
 * Единственный источник данных конструктора.
 * Чтобы изменить ассортимент/цены — правьте cakeData.json, код менять не нужно.
 */
export const cakeData = cakeDataJson as unknown as CakeData;

/** Контент витрины: тексты, галерея, контакты, доставка, юридические тексты. */
export const siteContent = siteContentJson as unknown as SiteContent;

/** Настройки кондитерской: владелец, PIN демо-кабинета, ставки себестоимости. */
export const businessSettings = businessJson as unknown as BusinessSettings;

/**
 * Стартовый состав торта: 2 кг (хит) + ягодная начинка,
 * чтобы превью сразу выглядело «вкусно».
 */
export function createDefaultConfig(): CakeConfig {
  const size = cakeData.sizes.find((item) => item.badge) ?? cakeData.sizes[0];
  const filling = cakeData.fillings.find((item) => item.id === 'berry') ?? cakeData.fillings[0];

  return {
    sizeId: size.id,
    baseId: cakeData.bases[0].id,
    fillingId: filling.id,
    creamId: cakeData.creams[0].id,
    decorationIds: [],
    inscription: '',
  };
}
