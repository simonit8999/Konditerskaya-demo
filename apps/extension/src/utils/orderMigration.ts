import { businessSettings } from '@/references';
import type {
  ActorRole,
  CakeConfig,
  ContactChannel,
  CustomerInfo,
  DeliveryInfo,
  Order,
  OrderFinance,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  SyncStatus,
} from '@/types';
import { calculateOrderFinance } from '@/utils/orderFinance';

type JsonRecord = Record<string, unknown>;

/** Старые статусы (processing/delivered) переводим в новую модель. */
const LEGACY_STATUS: Record<string, OrderStatus> = {
  new: 'new',
  processing: 'confirmed',
  confirmed: 'confirmed',
  ready: 'ready',
  delivered: 'completed',
  completed: 'completed',
  declined: 'declined',
};

const SYNC_STATUSES: SyncStatus[] = ['sent', 'demo', 'failed'];
const ACTORS: ActorRole[] = ['customer', 'owner', 'system'];
const CHANNELS: ContactChannel[] = ['telegram', 'whatsapp', 'instagram', 'vk', 'other'];

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function migrateOrderStatus(status: string): OrderStatus {
  return LEGACY_STATUS[status] ?? 'new';
}

function parseConfig(value: unknown): CakeConfig | null {
  const record = asRecord(value);
  if (!record) return null;

  const sizeId = asString(record.sizeId);
  const baseId = asString(record.baseId);
  const fillingId = asString(record.fillingId);
  const creamId = asString(record.creamId);
  if (!sizeId || !baseId || !fillingId || !creamId) return null;

  return {
    sizeId,
    baseId,
    fillingId,
    creamId,
    decorationIds: Array.isArray(record.decorationIds)
      ? record.decorationIds.filter((id): id is string => typeof id === 'string')
      : [],
    inscription: asString(record.inscription),
  };
}

function parseItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];

  const items: OrderItem[] = [];
  value.forEach((raw, index) => {
    const record = asRecord(raw);
    if (!record) return;

    const config = parseConfig(record.config);
    if (!config) return;

    items.push({
      id: asString(record.id, `item_${index}`),
      config,
      price: asNumber(record.price),
      title: asString(record.title, 'Торт'),
      composition: Array.isArray(record.composition)
        ? record.composition.filter((row): row is string => typeof row === 'string')
        : [],
    });
  });

  return items;
}

function parseContact(value: unknown): CustomerInfo['contact'] | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const channel = asString(record.channel) as ContactChannel;
  const handle = asString(record.handle).trim();
  if (!handle || !CHANNELS.includes(channel)) return undefined;

  return { channel, handle };
}

function parseCustomer(value: unknown): CustomerInfo | null {
  const record = asRecord(value);
  if (!record) return null;

  const name = asString(record.name).trim();
  const phone = asString(record.phone).trim();
  if (!name || !phone) return null;

  return {
    name,
    phone,
    email: asOptionalString(record.email),
    contact: parseContact(record.contact),
  };
}

function parseDelivery(value: unknown): DeliveryInfo | null {
  const record = asRecord(value);
  if (!record) return null;

  const date = asString(record.date);
  const timeSlot = asString(record.timeSlot);
  if (!date || !timeSlot) return null;

  return {
    method: asString(record.method) === 'delivery' ? 'delivery' : 'pickup',
    date,
    timeSlot,
    address: asOptionalString(record.address),
    comment: asOptionalString(record.comment),
  };
}

function parseFinance(value: unknown): OrderFinance | null {
  const record = asRecord(value);
  if (!record) return null;

  const keys = [
    'itemsCost',
    'packagingCost',
    'deliveryCost',
    'costTotal',
    'profit',
    'marginPercent',
  ] as const;

  if (
    !keys.every((key) => typeof record[key] === 'number' && Number.isFinite(record[key] as number))
  ) {
    return null;
  }

  return {
    itemsCost: asNumber(record.itemsCost),
    packagingCost: asNumber(record.packagingCost),
    deliveryCost: asNumber(record.deliveryCost),
    costTotal: asNumber(record.costTotal),
    profit: asNumber(record.profit),
    marginPercent: asNumber(record.marginPercent),
  };
}

function parseHistory(value: unknown): OrderStatusEvent[] | null {
  if (!Array.isArray(value)) return null;

  const events: OrderStatusEvent[] = [];
  value.forEach((raw) => {
    const record = asRecord(raw);
    if (!record) return;

    const status = LEGACY_STATUS[asString(record.status)];
    const at = asString(record.at);
    if (!status || !at) return;

    const actor = asString(record.actor) as ActorRole;
    events.push({
      status,
      at,
      actor: ACTORS.includes(actor) ? actor : 'system',
      note: asOptionalString(record.note),
    });
  });

  return events.length > 0 ? events : null;
}

/**
 * Приводит заказ из localStorage (включая данные старых версий) к текущей модели.
 * Возвращает null, если запись повреждена настолько, что её нельзя показать.
 */
export function migrateOrder(raw: unknown): Order | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = asString(record.id);
  const number = asString(record.number);
  const items = parseItems(record.items);
  const customer = parseCustomer(record.customer);
  const delivery = parseDelivery(record.delivery);

  if (!id || !number || items.length === 0 || !customer || !delivery) return null;

  const createdAt = asString(record.createdAt) || new Date().toISOString();
  const status = migrateOrderStatus(asString(record.status, 'new'));
  const subtotal = asNumber(
    record.subtotal,
    items.reduce((sum, item) => sum + item.price, 0),
  );
  const deliveryFee = asNumber(record.deliveryFee);
  const total = asNumber(record.total, subtotal + deliveryFee);
  const comment = asOptionalString(record.comment) ?? asOptionalString(delivery.comment);
  const finance =
    parseFinance(record.finance) ??
    calculateOrderFinance({
      items,
      deliveryMethod: delivery.method,
      total,
      settings: businessSettings.finance,
    });

  const statusHistory = parseHistory(record.statusHistory) ?? [];
  if (statusHistory.length === 0) {
    statusHistory.push({ status, at: createdAt, actor: 'system' });
  } else if (statusHistory[statusHistory.length - 1].status !== status) {
    statusHistory.push({ status, at: createdAt, actor: 'system' });
  }

  const syncRaw = asString(record.syncStatus) as SyncStatus;
  const syncStatus = SYNC_STATUSES.includes(syncRaw) ? syncRaw : 'demo';

  return {
    id,
    number,
    items,
    customer,
    delivery,
    subtotal,
    deliveryFee,
    total,
    status,
    createdAt,
    syncStatus,
    syncError: asOptionalString(record.syncError),
    comment,
    finance,
    statusHistory,
    confirmedAt: asOptionalString(record.confirmedAt),
    readyAt: asOptionalString(record.readyAt),
    completedAt: asOptionalString(record.completedAt),
    declinedAt: asOptionalString(record.declinedAt),
    ownerNote: asOptionalString(record.ownerNote),
    isDemo: record.isDemo === true ? true : undefined,
  };
}

/** Миграция всего списка заказов; повреждённые записи отбрасываются. */
export function migrateOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => migrateOrder(item))
    .filter((order): order is Order => order !== null);
}
