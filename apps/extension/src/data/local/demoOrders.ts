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
import { addDays, toISODate } from '@/utils/date';
import { calculateOrderFinance } from '@/utils/orderFinance';
import { createId, createOrderNumber } from '@/utils/id';
import { calculatePrice } from '@/utils/priceCalculator';

interface DemoSpec {
  status: OrderStatus;
  daysAgo: number;
  deliveryInDays: number;
  method: DeliveryMethod;
  customer: { name: string; phone: string; email?: string; contact?: ContactHandle };
  config: CakeConfig;
  comment?: string;
  address?: string;
  ownerNote?: string;
}

const DEMO_SPECS: DemoSpec[] = [
  {
    status: 'new',
    daysAgo: 0,
    deliveryInDays: 3,
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
    status: 'confirmed',
    daysAgo: 0,
    deliveryInDays: 2,
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
      decorationIds: ['figures', 'sprinkles'],
      inscription: 'Ане 30',
    },
    comment: 'Без глютена, пожалуйста. Свечи не нужны.',
  },
  {
    status: 'ready',
    daysAgo: 1,
    deliveryInDays: 1,
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
    daysAgo: 9,
    deliveryInDays: -6,
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
      decorationIds: ['berries', 'creamDecor'],
      inscription: 'С юбилеем!',
    },
    comment: 'Доставить к 15:00, пожалуйста.',
    address: 'Ленинградский пр-т, 40, офис 12',
    ownerNote: 'Клиент попросил добавить топпер с цифрой 50 — согласовано.',
  },
  {
    status: 'completed',
    daysAgo: 16,
    deliveryInDays: -14,
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
    status: 'declined',
    daysAgo: 4,
    deliveryInDays: 0,
    method: 'delivery',
    customer: { name: 'Алексей Морозов', phone: '+7 (999) 666-77-88' },
    config: {
      sizeId: '2kg',
      baseId: 'sponge',
      fillingId: 'chocolate',
      creamId: 'cream',
      decorationIds: [],
      inscription: '',
    },
    comment: 'Перезвоните, пожалуйста, после 18:00.',
    address: 'ул. Тестовая, 3',
  },
  // Повторные клиенты: чтобы вкладка «Клиенты» и группировка по телефону были осмысленными.
  {
    status: 'completed',
    daysAgo: 12,
    deliveryInDays: -11,
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
    daysAgo: 25,
    deliveryInDays: -24,
    method: 'delivery',
    customer: {
      name: 'Мария Соколова',
      phone: '+7 (999) 111-22-33',
      contact: { channel: 'telegram', handle: '@maria_s' },
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
  {
    status: 'completed',
    daysAgo: 20,
    deliveryInDays: -19,
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
];

function shiftIso(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();
}

function buildHistory(status: OrderStatus, createdAt: string): OrderStatusEvent[] {
  const history: OrderStatusEvent[] = [{ status: 'new', at: createdAt, actor: 'customer' }];

  if (status === 'new') return history;
  if (status === 'declined') {
    history.push({ status: 'declined', at: shiftIso(createdAt, 3), actor: 'owner' });
    return history;
  }

  history.push({ status: 'confirmed', at: shiftIso(createdAt, 2), actor: 'owner' });
  if (status === 'confirmed') return history;

  history.push({ status: 'ready', at: shiftIso(createdAt, 26), actor: 'owner' });
  if (status === 'completed') {
    history.push({ status: 'completed', at: shiftIso(createdAt, 30), actor: 'owner' });
  }

  return history;
}

function buildDemoOrder(spec: DemoSpec): Order {
  const now = new Date();
  const createdAt = addDays(now, -spec.daysAgo).toISOString();
  const history = buildHistory(spec.status, createdAt);
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

/** Набор демо-заказов для кабинета владельца: все статусы и разные сценарии. */
export function buildDemoOrders(): Order[] {
  return DEMO_SPECS.map(buildDemoOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
