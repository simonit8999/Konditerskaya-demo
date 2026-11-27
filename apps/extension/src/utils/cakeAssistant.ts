import { cakeData } from '@/references';
import type { CakeConfig } from '@/types';
import { getBase, getCream, getFilling, getSize } from '@/utils/cake';
import { formatPrice } from '@/utils/formatPrice';
import { calculatePrice } from '@/utils/priceCalculator';

export type AssistantOccasion = 'birthday' | 'kids' | 'wedding' | 'corporate' | 'anniversary';
export type AssistantTaste = 'chocolate' | 'berry' | 'caramel' | 'fruit' | 'unsure';
export type AssistantStyle = 'minimal' | 'classic' | 'bright' | 'themed';
export type AssistantRestriction = 'nuts' | 'lactose' | 'gluten' | 'fondant' | 'berries' | 'dyes';

export interface AssistantAnswers {
  occasion: AssistantOccasion;
  guests: number;
  taste: AssistantTaste;
  restrictions: AssistantRestriction[];
  style: AssistantStyle;
  budget: number;
}

export interface AssistantOption {
  id: string;
  title: string;
  reason: string;
  config: CakeConfig;
  price: number;
  withinBudget: boolean;
  warnings: string[];
}

const OCCASION_BASE: Record<AssistantOccasion, string> = {
  birthday: 'sponge',
  kids: 'sponge',
  wedding: 'mousse',
  corporate: 'honey',
  anniversary: 'mousse',
};

const TASTE_FILLING: Record<AssistantTaste, string> = {
  chocolate: 'chocolate',
  berry: 'berry',
  caramel: 'caramel',
  fruit: 'fruit',
  unsure: 'berry',
};

const TASTE_CREAM: Record<AssistantTaste, string> = {
  chocolate: 'choco',
  berry: 'cheese',
  caramel: 'cream',
  fruit: 'curd',
  unsure: 'cream',
};

const STYLE_DECORATIONS: Record<AssistantStyle, string[]> = {
  minimal: [],
  classic: ['creamDecor'],
  bright: ['berries', 'sprinkles'],
  themed: ['figures', 'fondant'],
};

const OCCASION_INSCRIPTION: Record<AssistantOccasion, string> = {
  birthday: 'С днём рождения!',
  kids: 'С днём рождения!',
  wedding: 'Свадьба',
  corporate: 'С праздником!',
  anniversary: 'С годовщиной!',
};

interface Picked {
  id: string;
  warning?: string;
}

function pickBase(answers: AssistantAnswers): Picked {
  const preferred = OCCASION_BASE[answers.occasion];

  if (answers.restrictions.includes('gluten')) {
    const safe = cakeData.bases.find((base) => !(base.allergens ?? []).includes('gluten'));
    if (safe) return { id: safe.id };
    return {
      id: preferred,
      warning: 'Безглютеновой основы в каталоге нет — обсудите замену с кондитером.',
    };
  }

  return { id: preferred };
}

function pickFilling(answers: AssistantAnswers): Picked {
  const preferred = TASTE_FILLING[answers.taste];
  const filling = cakeData.fillings.find((item) => item.id === preferred);

  if (
    filling &&
    answers.restrictions.includes('berries') &&
    (filling.allergens ?? []).includes('berries')
  ) {
    const safe = cakeData.fillings.find((item) => !(item.allergens ?? []).includes('berries'));
    if (safe) {
      return { id: safe.id, warning: 'Заменили ягодную начинку из-за ограничения по ягодам.' };
    }
  }

  return { id: preferred };
}

function pickCream(answers: AssistantAnswers): Picked {
  const preferred = TASTE_CREAM[answers.taste];

  if (answers.restrictions.includes('lactose')) {
    return {
      id: preferred,
      warning: 'В демо-кремах есть лактоза — безлактозную замену нужно подтвердить у кондитера.',
    };
  }

  return { id: preferred };
}

function decorationIdsFor(
  style: AssistantStyle,
  restrictions: AssistantRestriction[],
): string[] {
  return STYLE_DECORATIONS[style].filter((id) => {
    if (restrictions.includes('fondant') && id === 'fondant') return false;

    const item = cakeData.decorations.find((decoration) => decoration.id === id);
    if (!item) return false;

    return !(item.allergens ?? []).some((allergen) =>
      restrictions.some((restriction) => restriction === allergen),
    );
  });
}

function sizeIdFor(guests: number, offset: number): string {
  const baseIndex = guests <= 8 ? 0 : guests <= 14 ? 1 : 2;
  const index = Math.min(cakeData.sizes.length - 1, Math.max(0, baseIndex + offset));
  return cakeData.sizes[index].id;
}

function buildReason(config: CakeConfig): string {
  const size = getSize(config.sizeId);
  const decorations = config.decorationIds
    .map((id) => cakeData.decorations.find((item) => item.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  return [
    `${size.label} (${size.servings})`,
    getBase(config.baseId).label,
    getFilling(config.fillingId).label,
    getCream(config.creamId).label,
    decorations.length > 0 ? `декор: ${decorations.join(', ')}` : 'без декора',
  ].join(' · ');
}

/**
 * Демо-подбор торта на правилах (без LLM).
 *
 * Считает вес по гостям, вкус — по начинке/крему, декор — по стилю,
 * исключает аллергены, которые есть в данных cakeData.json.
 * Медицинских советов не даёт: спорные случаи всегда сопровождает
 * предупреждением «подтвердите у кондитера».
 */
export function recommendCakes(answers: AssistantAnswers): AssistantOption[] {
  const guests = Number.isFinite(answers.guests) ? Math.max(1, Math.round(answers.guests)) : 10;
  const normalized: AssistantAnswers = { ...answers, guests };

  const base = pickBase(normalized);
  const filling = pickFilling(normalized);
  const cream = pickCream(normalized);
  const decorations = decorationIdsFor(normalized.style, normalized.restrictions);
  const budget = Number.isFinite(normalized.budget) ? Math.max(0, normalized.budget) : 0;

  const globalWarnings: string[] = [];
  if (base.warning) globalWarnings.push(base.warning);
  if (filling.warning) globalWarnings.push(filling.warning);
  if (cream.warning) globalWarnings.push(cream.warning);

  if (normalized.restrictions.includes('nuts')) {
    globalWarnings.push(
      'Орехов в демо-каталоге нет, но следы на производстве нужно подтвердить у кондитера.',
    );
  }
  if (normalized.restrictions.includes('fondant')) {
    globalWarnings.push('Мастику исключили из декора.');
  }
  if (normalized.restrictions.includes('dyes')) {
    globalWarnings.push('Исключили декор с красителями — остальные позиции уточните у кондитера.');
  }
  if (normalized.restrictions.includes('gluten')) {
    globalWarnings.push('Основу выбрали без глютена, но состав подтвердите перед заказом.');
  }
  if (guests > 22) {
    globalWarnings.push('Для большой компании может понадобиться несколько тортов.');
  }

  const candidates: AssistantOption[] = [];

  const push = (
    id: string,
    title: string,
    sizeOffset: number,
    decorationIds: string[],
    withInscription: boolean,
  ) => {
    const config: CakeConfig = {
      sizeId: sizeIdFor(guests, sizeOffset),
      baseId: base.id,
      fillingId: filling.id,
      creamId: cream.id,
      decorationIds,
      inscription: withInscription ? OCCASION_INSCRIPTION[normalized.occasion] : '',
    };

    const price = calculatePrice(config, cakeData).total;
    const withinBudget = budget === 0 || price <= budget;
    const warnings = [...globalWarnings];

    if (!withinBudget) {
      warnings.push(`Выше бюджета на ${formatPrice(price - budget)}.`);
    }

    candidates.push({
      id,
      title,
      reason: buildReason(config),
      config,
      price,
      withinBudget,
      warnings: Array.from(new Set(warnings)),
    });
  };

  push('recommended', 'Рекомендуем', 0, decorations, false);
  push('economy', 'Экономнее', -1, decorations.slice(0, 1), false);
  push('festive', 'Праздничный вариант', 1, decorations, true);

  const seen = new Set<string>();
  const unique = candidates.filter((option) => {
    const key = [
      option.config.sizeId,
      option.config.baseId,
      option.config.fillingId,
      option.config.creamId,
      [...option.config.decorationIds].sort().join('+'),
      option.config.inscription,
    ].join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 3);
}
