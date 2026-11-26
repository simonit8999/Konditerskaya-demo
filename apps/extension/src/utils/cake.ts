import { cakeData } from '@/references';
import type {
  CakeBase,
  CakeConfig,
  CakeCream,
  CakeData,
  CakeDecoration,
  CakeFilling,
  CakeSize,
} from '@/types';

export const MAX_INSCRIPTION_LENGTH = cakeData.pricing.maxInscriptionLength;

export function getSize(id: string, data: CakeData = cakeData): CakeSize {
  return data.sizes.find((item) => item.id === id) ?? data.sizes[0];
}

export function getBase(id: string, data: CakeData = cakeData): CakeBase {
  return data.bases.find((item) => item.id === id) ?? data.bases[0];
}

export function getFilling(id: string, data: CakeData = cakeData): CakeFilling {
  return data.fillings.find((item) => item.id === id) ?? data.fillings[0];
}

export function getCream(id: string, data: CakeData = cakeData): CakeCream {
  return data.creams.find((item) => item.id === id) ?? data.creams[0];
}

export function getDecorations(ids: string[], data: CakeData = cakeData): CakeDecoration[] {
  return data.decorations.filter((item) => ids.includes(item.id));
}

/** Разрешённые символы надписи: буквы, цифры, пробелы и простая пунктуация. */
export function sanitizeInscription(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s!?.,'’"«»()+\-&:;]/gu, '')
    .slice(0, MAX_INSCRIPTION_LENGTH);
}

export interface CakeDescription {
  title: string;
  shortLine: string;
  composition: string[];
}

/** Человекочитаемое описание состава для корзины, заказа и Telegram. */
export function describeCake(config: CakeConfig, data: CakeData = cakeData): CakeDescription {
  const size = getSize(config.sizeId, data);
  const base = getBase(config.baseId, data);
  const filling = getFilling(config.fillingId, data);
  const cream = getCream(config.creamId, data);
  const decorations = getDecorations(config.decorationIds, data);
  const inscription = config.inscription.trim();

  const composition = [
    `Вес: ${size.label} (${size.servings})`,
    `Основа: ${base.label}`,
    `Начинка: ${filling.label}`,
    `Крем: ${cream.label}`,
    `Декор: ${decorations.length > 0 ? decorations.map((item) => item.label).join(', ') : 'без декора'}`,
    `Надпись: ${inscription ? `«${inscription}»` : 'без надписи'}`,
  ];

  return {
    title: `Торт ${size.label} · ${base.label}`,
    shortLine: `${size.label} · ${base.label} · ${filling.label} · ${cream.label}`,
    composition,
  };
}

/** Сравнение составов (для режима редактирования позиции в корзине). */
export function configsEqual(a: CakeConfig, b: CakeConfig): boolean {
  return (
    a.sizeId === b.sizeId &&
    a.baseId === b.baseId &&
    a.fillingId === b.fillingId &&
    a.creamId === b.creamId &&
    a.inscription.trim() === b.inscription.trim() &&
    a.decorationIds.length === b.decorationIds.length &&
    a.decorationIds.every((id) => b.decorationIds.includes(id))
  );
}
