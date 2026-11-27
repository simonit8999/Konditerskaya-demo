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

interface DemoSpec {
  status: OrderStatus;
  /** Сколько дней назад оформлен заказ: 0 — сегодня. */
  daysAgo: number;
  /** Час и минуты оформления — история статусов идёт по порядку и не уезжает в будущее. */
  hour: number;
  minute: number;
  /** Дата получения относительно сегодняшнего дня (может быть в прошлом). */
  deliveryInDays: number;
  method: DeliveryMethod;
  customer: { name: string; phone: string; email?: string; contact?: ContactHandle };
  config: CakeConfig;
  comment?: string;
  address?: string;
  ownerNote?: string;
}

const DEMO_SPECS: DemoSpec[] = [
  // Сегодня: 5 свежих заказов — на них удобно пробовать статусы и оплату.
  {
    status: 'new',
    daysAgo: 0,
    hour: 9,
    minute: 15,
    deliveryInDays: 2,
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
      inscription: 'С днём рождения, Аня!',
    },
    comment: 'Аллергия на орехи, без мастики. Нужны свечи «30», позвонить за час до доставки.',
    address: 'ул. Примерная, 12, кв. 45',
  },
  {
    status: 'new',
    daysAgo: 0,
    hour: 10,
    minute: 40,
    deliveryInDays: 3,
    method: 'pickup',
    customer: { name: 'Павел Крылов', phone: '+7 (999) 321-54-76' },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'chocolate',
      creamId: 'cream',
      decorationIds: ['sprinkles'],
      inscription: 'С днём рождения, Кира!',
    },
    comment: 'Свечи не нужны, торт-сюрприз.',
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
      sizeId: '3kg',
      baseId: 'sponge',
      fillingId: 'caramel',
      creamId: 'cream',
      decorationIds: ['berries'],
      inscription: 'С юбилеем!',
    },
    comment: 'Доставить к 15:00, пожалуйста.',
    address: 'Ленинградский пр-т, 40, офис 12',
  },
  {
    status: 'ready',
    daysAgo: 0,
    hour: 13,
    minute: 30,
    deliveryInDays: 0,
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
    ownerNote: 'Клиент оплатит при получении — торт готов и ждёт в витрине.',
  },
  // Прошлые дни: доставленные заказы — из них складываются выручка и прибыль.
  {
    status: 'completed',
    daysAgo: 1,
    hour: 10,
    minute: 20,
    deliveryInDays: -1,
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
    deliveryInDays: -1,
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
    deliveryInDays: -2,
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
    deliveryInDays: -2,
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
    deliveryInDays: -3,
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
    deliveryInDays: -3,
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
    deliveryInDays: -4,
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
    deliveryInDays: -4,
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
    deliveryInDays: -5,
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
    deliveryInDays: -5,
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

function buildHistory(status: OrderStatus, createdAt: string, now: Date): OrderStatusEvent[] {
  const created = new Date(createdAt);
  const latest = latestMoment(now);
  const after = (hours: number): string =>
    notLaterThan(new Date(created.getTime() + hours * 60 * MS_PER_MINUTE), latest).toISOString();

  const history: OrderStatusEvent[] = [{ status: 'new', at: createdAt, actor: 'customer' }];

  if (status === 'new') return history;
  if (status === 'declined') {
    history.push({ status: 'declined', at: after(3), actor: 'owner' });
    return history;
  }

  history.push({ status: 'confirmed', at: after(1), actor: 'owner' });
  if (status === 'confirmed') return history;

  history.push({ status: 'ready', at: after(2), actor: 'owner' });
  if (status === 'completed') {
    history.push({ status: 'completed', at: after(3), actor: 'owner' });
  }

  return history;
}

function buildDemoOrder(spec: DemoSpec): Order {
  const now = new Date();
  const createdAt = specCreatedAt(spec, now).toISOString();
  const history = buildHistory(spec.status, createdAt, now);
  const price = calculatePrice(spec.config, cakeData).total;
  const description = describeCake(spec.config, cakeData);
  const deliveryFee = spec.method === 'delivery' ? siteContent.delivery.fee : 0;
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
      date: toISODate(addDays(now, spec.deliveryInDays)),
      timeSlot: siteContent.delivery.timeSlots[1] ?? '12:00–14:00',
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
 * 10 доставленных заказов за последние 5 дней (по 2 в день — из них выручка и прибыль)
 * и 5 заказов за сегодня в работе, чтобы можно было менять статусы и отмечать оплату.
 */
export function buildDemoOrders(): Order[] {
  return DEMO_SPECS.map(buildDemoOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
