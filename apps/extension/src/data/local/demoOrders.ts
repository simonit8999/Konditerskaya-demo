import { cakeData, siteContent } from '@/references';
import { isDemoMode } from '@/services/ordersService';
import type {
  CakeConfig,
  ContactHandle,
  DeliveryMethod,
  Order,
  OrderStatus,
  OrderStatusEvent,
} from '@/types';
import { describeCake } from '@/utils/cake';
import { addDays, startOfDay, toISODate } from '@/utils/date';
import { calculateOrderFinance } from '@/utils/orderFinance';
import { createId, createOrderNumber } from '@/utils/id';
import { calculatePrice } from '@/utils/priceCalculator';

/**
 * Версия набора демо-заказов.
 * Меняйте при правке DEMO_SPECS: у тех, кто уже открывал кабинет, набор
 * обновится автоматически (реальные заказы при этом сохраняются).
 */
export const DEMO_DATA_VERSION = 2;

interface DemoSpec {
  status: OrderStatus;
  /** Сколько дней назад оформлен заказ: 0 — сегодня. */
  daysAgo: number;
  /** Час и минуты оформления — история статусов идёт по порядку и не уезжает в будущее. */
  hour: number;
  minute: number;
  /** Дата получения относительно сегодняшнего дня. Для completed не нужна: выдаём на следующий день. */
  deliveryInDays?: number;
  method: DeliveryMethod;
  /** Интервал получения из siteContent.delivery.timeSlots; по умолчанию второй (12:00–14:00). */
  timeSlotIndex?: number;
  customer: { name: string; phone: string; email?: string; contact?: ContactHandle };
  config: CakeConfig;
  comment?: string;
  address?: string;
  ownerNote?: string;
}

const DEMO_SPECS: DemoSpec[] = [
  // Сегодня: 4 свежих заказа — 2 новые заявки и 2 в работе.
  // На них удобно пробовать статусы, заметки и расчёт прибыли.
  {
    status: 'new',
    daysAgo: 0,
    hour: 9,
    minute: 15,
    deliveryInDays: 2,
    method: 'delivery',
    timeSlotIndex: 4,
    customer: {
      name: 'Мария Соколова',
      phone: '+7 (999) 111-22-33',
      contact: { channel: 'telegram', handle: '@maria_s' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'berry',
      creamId: 'cream',
      decorationIds: ['berries'],
      inscription: 'С днём рождения, мама!',
    },
    comment: 'Аллергия на орехи, без мастики. Нужны свечи «5», позвонить за час до доставки.',
    address: 'ул. Примерная, 12, кв. 45',
  },
  {
    status: 'new',
    daysAgo: 0,
    hour: 10,
    minute: 40,
    deliveryInDays: 3,
    method: 'pickup',
    timeSlotIndex: 1,
    customer: {
      name: 'Илья Морозов',
      phone: '+7 (903) 221-45-67',
      contact: { channel: 'whatsapp', handle: '+7 903 221-45-67' },
    },
    config: {
      sizeId: '3kg',
      baseId: 'honey',
      fillingId: 'chocolate',
      creamId: 'curd',
      decorationIds: ['figures', 'sprinkles'],
      inscription: 'С юбилеем, папа!',
    },
    comment: 'Торт-сюрприз для папы: свечи не нужны, заберём сами.',
  },
  {
    status: 'confirmed',
    daysAgo: 0,
    hour: 11,
    minute: 25,
    deliveryInDays: 2,
    method: 'pickup',
    customer: { name: 'Ольга Ким', phone: '+7 (999) 333-44-55' },
    config: {
      sizeId: '1kg',
      baseId: 'mousse',
      fillingId: 'fruit',
      creamId: 'cheese',
      decorationIds: ['creamDecor'],
      inscription: '',
    },
    comment: 'Дочке 6 лет: нужны свечи и топпер «6».',
    ownerNote: 'Подтверждено по телефону: заберут 28 ноября к 12:00.',
  },
  {
    status: 'confirmed',
    daysAgo: 0,
    hour: 12,
    minute: 50,
    deliveryInDays: 2,
    method: 'delivery',
    customer: {
      name: 'Дмитрий Волков',
      phone: '+7 (999) 444-55-66',
      email: 'dmitry@example.com',
      contact: { channel: 'telegram', handle: '@dmitry_v' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'caramel',
      creamId: 'cream',
      decorationIds: ['berries'],
      inscription: 'С днём рождения!',
    },
    comment: 'Доставить к 15:00, пожалуйста.',
    address: 'Ленинградский пр-т, 40, офис 12',
  },
  // Прошлые 5 дней: по 2 доставленных заказа в день — из них складываются
  // выручка, прибыль, средний чек и столбики графика.
  {
    status: 'completed',
    daysAgo: 1,
    hour: 10,
    minute: 20,
    method: 'delivery',
    customer: {
      name: 'Мария Соколова',
      phone: '+7 (999) 111-22-33',
      contact: { channel: 'telegram', handle: '@maria_s' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'berry',
      creamId: 'cream',
      decorationIds: ['berries'],
      inscription: 'С днём рождения!',
    },
    address: 'ул. Примерная, 12, кв. 45',
    ownerNote: 'Постоянный клиент: ягоды и надпись, как в прошлый раз.',
  },
  {
    status: 'completed',
    daysAgo: 1,
    hour: 17,
    minute: 5,
    method: 'pickup',
    customer: {
      name: 'Дмитрий Волков',
      phone: '+7 (999) 444-55-66',
      email: 'dmitry@example.com',
      contact: { channel: 'telegram', handle: '@dmitry_v' },
    },
    config: {
      sizeId: '3kg',
      baseId: 'sponge',
      fillingId: 'caramel',
      creamId: 'cream',
      decorationIds: ['berries', 'creamDecor'],
      inscription: 'С юбилеем!',
    },
    ownerNote: 'Клиент попросил добавить топпер с цифрой 50 — согласовано.',
  },
  {
    status: 'completed',
    daysAgo: 2,
    hour: 11,
    minute: 40,
    method: 'pickup',
    customer: { name: 'Ольга Ким', phone: '+7 (999) 333-44-55' },
    config: {
      sizeId: '1kg',
      baseId: 'mousse',
      fillingId: 'fruit',
      creamId: 'cheese',
      decorationIds: ['creamDecor'],
      inscription: '',
    },
  },
  {
    status: 'completed',
    daysAgo: 2,
    hour: 16,
    minute: 15,
    method: 'delivery',
    customer: {
      name: 'Игорь Петров',
      phone: '+7 (999) 222-33-44',
      contact: { channel: 'whatsapp', handle: '+7 999 222-33-44' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'honey',
      fillingId: 'chocolate',
      creamId: 'curd',
      decorationIds: ['figures', 'sprinkles'],
      inscription: 'Ане 30',
    },
    comment: 'Без глютена, пожалуйста. Свечи не нужны.',
    address: 'ул. Садовая, 8, кв. 3',
  },
  // Повторные клиенты: чтобы вкладка «Клиенты» и группировка по телефону были осмысленными.
  {
    status: 'completed',
    daysAgo: 3,
    hour: 9,
    minute: 50,
    method: 'pickup',
    customer: { name: 'Екатерина Лебедева', phone: '+7 (999) 555-66-77' },
    config: {
      sizeId: '2kg',
      baseId: 'honey',
      fillingId: 'berry',
      creamId: 'cheese',
      decorationIds: [],
      inscription: '',
    },
  },
  {
    status: 'completed',
    daysAgo: 3,
    hour: 14,
    minute: 30,
    method: 'delivery',
    customer: {
      name: 'Наталья Орлова',
      phone: '+7 (999) 777-88-99',
      contact: { channel: 'telegram', handle: '@orlova_n' },
    },
    config: {
      sizeId: '3kg',
      baseId: 'mousse',
      fillingId: 'berry',
      creamId: 'cheese',
      decorationIds: ['berries'],
      inscription: '',
    },
    comment: 'Для мамы, пожалуйста, без надписи.',
    address: 'пр-т Мира, 21, кв. 60',
  },
  {
    status: 'completed',
    daysAgo: 4,
    hour: 12,
    minute: 10,
    method: 'pickup',
    customer: {
      name: 'Мария Соколова',
      phone: '+7 (999) 111-22-33',
      contact: { channel: 'telegram', handle: '@maria_s' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'berry',
      creamId: 'cream',
      decorationIds: ['berries'],
      inscription: 'С днём рождения!',
    },
    ownerNote: 'Третий заказ клиента: постоянная надпись и ягоды, как в прошлый раз.',
  },
  {
    status: 'completed',
    daysAgo: 4,
    hour: 18,
    minute: 45,
    method: 'delivery',
    customer: { name: 'Сергей Титов', phone: '+7 (999) 888-99-00' },
    config: {
      sizeId: '1kg',
      baseId: 'sponge',
      fillingId: 'chocolate',
      creamId: 'cream',
      decorationIds: [],
      inscription: '',
    },
    address: 'ул. Лесная, 5',
  },
  {
    status: 'completed',
    daysAgo: 5,
    hour: 10,
    minute: 5,
    method: 'pickup',
    customer: {
      name: 'Игорь Петров',
      phone: '+7 (999) 222-33-44',
      contact: { channel: 'whatsapp', handle: '+7 999 222-33-44' },
    },
    config: {
      sizeId: '2kg',
      baseId: 'honey',
      fillingId: 'chocolate',
      creamId: 'curd',
      decorationIds: ['figures'],
      inscription: '',
    },
    comment: 'Повторный заказ: без глютена, как в прошлый раз.',
  },
  {
    status: 'completed',
    daysAgo: 5,
    hour: 15,
    minute: 35,
    method: 'delivery',
    customer: {
      name: 'Анна Белова',
      phone: '+7 (999) 123-45-67',
      contact: { channel: 'telegram', handle: '@anna_belova' },
    },
    config: {
      sizeId: '3kg',
      baseId: 'sponge',
      fillingId: 'berry',
      creamId: 'cream',
      decorationIds: ['berries', 'creamDecor'],
      inscription: 'Любимой маме',
    },
    address: 'ул. Примерная, 12, кв. 45',
  },
];

const MS_PER_MINUTE = 60 * 1000;

/** Событие не может оказаться в будущем — иначе история статусов выглядит странно. */
function notLaterThan(date: Date, latest: Date): Date {
  return date.getTime() > latest.getTime() ? latest : date;
}

/** «Сейчас минус минута», но не раньше начала сегодняшнего дня (заказы «за сегодня»). */
function latestMoment(now: Date): Date {
  return new Date(Math.max(now.getTime() - MS_PER_MINUTE, startOfDay(now).getTime()));
}

/** Время оформления: нужный день + час/минуты из спецификации, но не позже «сейчас». */
function specCreatedAt(spec: DemoSpec, now: Date): Date {
  const day = startOfDay(addDays(now, -spec.daysAgo));
  day.setHours(spec.hour, spec.minute, 0, 0);
  return notLaterThan(day, latestMoment(now));
}

/** Часы начала интервала получения: «12:00–14:00» → 12. */
function slotStartHour(timeSlot: string): number {
  const match = /^(\d{1,2}):/.exec(timeSlot);
  const hour = match ? Number(match[1]) : Number.NaN;
  return Number.isFinite(hour) ? hour : 12;
}

/**
 * История статусов. Доставленные заказы выдаём на следующий день после
 * оформления, поэтому «готов» и «доставлен» ставим в день получения —
 * события не могут оказаться раньше самого заказа.
 */
function buildHistory(
  status: OrderStatus,
  createdAt: string,
  deliveryDate: Date,
  completedHour: number,
  now: Date,
): OrderStatusEvent[] {
  const created = new Date(createdAt);
  const latest = latestMoment(now);
  const after = (hours: number): string =>
    notLaterThan(new Date(created.getTime() + hours * 60 * MS_PER_MINUTE), latest).toISOString();
  const atDelivery = (hour: number): string => {
    const moment = startOfDay(deliveryDate);
    moment.setHours(hour, 0, 0, 0);
    return notLaterThan(moment, latest).toISOString();
  };

  const history: OrderStatusEvent[] = [{ status: 'new', at: createdAt, actor: 'customer' }];

  if (status === 'new') return history;
  if (status === 'declined') {
    history.push({ status: 'declined', at: after(3), actor: 'owner' });
    return history;
  }

  history.push({ status: 'confirmed', at: after(1), actor: 'owner' });
  if (status === 'confirmed') return history;

  history.push({ status: 'ready', at: atDelivery(Math.max(0, completedHour - 2)), actor: 'owner' });
  if (status === 'completed') {
    history.push({ status: 'completed', at: atDelivery(completedHour), actor: 'owner' });
  }

  return history;
}

function buildDemoOrder(spec: DemoSpec): Order {
  const now = new Date();
  const createdAt = specCreatedAt(spec, now).toISOString();
  const timeSlots = siteContent.delivery.timeSlots;
  const timeSlot = timeSlots[spec.timeSlotIndex ?? 1] ?? timeSlots[0] ?? '12:00–14:00';
  // Доставленные заказы оформлены накануне выдачи — дата получения «завтра».
  const deliveryOffset = spec.status === 'completed' ? 1 - spec.daysAgo : spec.deliveryInDays ?? 2;
  const deliveryDate = addDays(now, deliveryOffset);
  const history = buildHistory(
    spec.status,
    createdAt,
    deliveryDate,
    slotStartHour(timeSlot),
    now,
  );
  const price = calculatePrice(spec.config, cakeData).total;
  const description = describeCake(spec.config, cakeData);
  // Те же правила, что в оформлении заказа: от freeFrom доставка бесплатная.
  const deliveryFee =
    spec.method === 'delivery' && price < siteContent.delivery.freeFrom
      ? siteContent.delivery.fee
      : 0;
  const total = price + deliveryFee;

  const at = (status: OrderStatus): string | undefined =>
    [...history].reverse().find((event) => event.status === status)?.at;

  return {
    id: createId('demo'),
    number: createOrderNumber(),
    items: [
      {
        id: createId('cake'),
        config: spec.config,
        price,
        title: description.title,
        composition: description.composition,
      },
    ],
    customer: spec.customer,
    delivery: {
      method: spec.method,
      date: toISODate(deliveryDate),
      timeSlot,
      address: spec.method === 'delivery' ? spec.address : undefined,
    },
    subtotal: price,
    deliveryFee,
    total,
    status: spec.status,
    createdAt,
    syncStatus: isDemoMode ? 'demo' : 'sent',
    comment: spec.comment,
    finance: calculateOrderFinance({
      items: [{ price }],
      deliveryMethod: spec.method,
      total,
    }),
    statusHistory: history,
    confirmedAt: at('confirmed'),
    readyAt: at('ready'),
    completedAt: at('completed'),
    declinedAt: at('declined'),
    ownerNote: spec.ownerNote,
    isDemo: true,
  };
}

/**
 * Набор демо-заказов для кабинета владельца:
 * 10 доставленных заказов за прошлые 5 дней (по 2 в день — из них выручка,
 * прибыль, средний чек и график) и 4 заказа за сегодня — 2 новые заявки
 * и 2 в работе, чтобы можно было пробовать статусы, заметки и оплату.
 */
export function buildDemoOrders(): Order[] {
  return DEMO_SPECS.map(buildDemoOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
