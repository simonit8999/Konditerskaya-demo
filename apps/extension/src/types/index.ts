/**
 * Доменные типы приложения «Кондитерский Рай».
 *
 * Данные конструктора приходят из src/references/cakeData.json,
 * контент сайта — из src/references/siteContent.json.
 */

export interface CakeSize {
  id: string;
  label: string;
  weightKg: number;
  basePrice: number;
  multiplier: number;
  servings: string;
  hint?: string;
  badge?: string;
}

export interface CakeBase {
  id: string;
  label: string;
  extraPrice: number;
  description: string;
  palette: { tier: string; accent: string };
  /** Аллергены и ограничения: gluten, lactose, eggs, honey… */
  allergens?: string[];
}

export interface CakeFilling {
  id: string;
  label: string;
  extraPrice: number;
  description: string;
  palette: { filling: string };
  allergens?: string[];
}

export interface CakeCream {
  id: string;
  label: string;
  extraPrice: number;
  description: string;
  palette: { cream: string };
  allergens?: string[];
}

export type DecorationPreviewType = 'berries' | 'figures' | 'sprinkles' | 'fondant' | 'cream';

export interface CakeDecoration {
  id: string;
  label: string;
  price: number;
  description: string;
  preview: { type: DecorationPreviewType };
  allergens?: string[];
}

export interface CakePricing {
  inscriptionPrice: number;
  rounding: number;
  maxInscriptionLength: number;
  minWeightKg: number;
  minLeadHours: number;
}

export interface CakeData {
  version: number;
  currency: string;
  pricing: CakePricing;
  sizes: CakeSize[];
  bases: CakeBase[];
  fillings: CakeFilling[];
  creams: CakeCream[];
  decorations: CakeDecoration[];
}

/** Состав торта, который выбирает клиент. */
export interface CakeConfig {
  sizeId: string;
  baseId: string;
  fillingId: string;
  creamId: string;
  decorationIds: string[];
  inscription: string;
}

export interface PriceBreakdown {
  base: number;
  extras: number;
  decorations: number;
  inscription: number;
  total: number;
}

export interface CartItem {
  id: string;
  config: CakeConfig;
  price: number;
  addedAt: string;
}

export type DeliveryMethod = 'delivery' | 'pickup';

/** Канал связи, который клиент указал дополнительно к телефону. */
export type ContactChannel = 'telegram' | 'whatsapp' | 'instagram' | 'vk' | 'other';

export interface ContactHandle {
  channel: ContactChannel;
  handle: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  /** Необязательный ник в мессенджере — если клиенту так удобнее. */
  contact?: ContactHandle;
}

export interface DeliveryInfo {
  method: DeliveryMethod;
  date: string;
  timeSlot: string;
  address?: string;
  /**
   * Устаревшее поле: до версии с кабинетом владельца комментарий хранился здесь.
   * Оставлено для чтения старых заказов, новые пишутся в Order.comment.
   */
  comment?: string;
}

/** Позиция заказа: снимок состава и цены на момент оформления. */
export interface OrderItem {
  id: string;
  config: CakeConfig;
  price: number;
  title: string;
  composition: string[];
}

export type OrderStatus = 'new' | 'confirmed' | 'ready' | 'completed' | 'declined';

/** Кто изменил статус заказа. */
export type ActorRole = 'customer' | 'owner' | 'system';

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  actor: ActorRole;
  note?: string;
}

/**
 * Снимок себестоимости и прибыли на момент оформления.
 * Хранится в заказе, чтобы изменение ставок в business.json
 * не переписывало историю задним числом.
 */
export interface OrderFinance {
  itemsCost: number;
  packagingCost: number;
  deliveryCost: number;
  costTotal: number;
  profit: number;
  marginPercent: number;
}

/** Как заказ ушёл кондитеру. */
export type SyncStatus = 'sent' | 'demo' | 'failed';

export interface Order {
  id: string;
  number: string;
  items: OrderItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  syncStatus: SyncStatus;
  syncError?: string;
  /** Комментарий клиента на уровне заказа (аллергии, декор, звонок). */
  comment?: string;
  finance: OrderFinance;
  statusHistory: OrderStatusEvent[];
  confirmedAt?: string;
  readyAt?: string;
  completedAt?: string;
  declinedAt?: string;
  ownerNote?: string;
  /** Демо-заказ из кабинета владельца — чтобы не смешивать с реальными. */
  isDemo?: boolean;
}

export type NotificationAudience = 'customer' | 'owner';

export type NotificationType =
  | 'order_created'
  | 'order_confirmed'
  | 'order_ready'
  | 'order_completed'
  | 'order_declined'
  | 'order_note';

export interface OrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  audience: NotificationAudience;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

/** Настройки кондитерской: владелец, PIN демо-кабинета и ставки себестоимости. */
export interface BusinessSettings {
  owner: {
    name: string;
    title: string;
    pin: string;
  };
  finance: {
    /** Доля себестоимости ингредиентов от цены позиции (0…1). */
    defaultCostRate: number;
    packagingCostPerItem: number;
    deliveryCost: number;
  };
  admin: {
    demoSeed: boolean;
  };
}

export interface SendOrderResult {
  ok: boolean;
  mode: 'telegram' | 'log' | 'demo' | 'failed';
  error?: string;
}

export interface SiteFeature {
  icon: string;
  title: string;
  text: string;
}

export interface SiteStep {
  title: string;
  text: string;
}

export interface SiteGalleryItem {
  slug: string;
  alt: string;
  caption: string;
  tag: string;
  objectPosition: string;
  featured: boolean;
}

export interface SiteContent {
  brand: {
    name: string;
    latinName: string;
    tagline: string;
    isDemo: boolean;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: { value: string; label: string }[];
  };
  features: SiteFeature[];
  steps: SiteStep[];
  capabilities: string[];
  gallery: {
    title: string;
    subtitle: string;
    note: string;
    filters: { id: string; label: string }[];
    items: SiteGalleryItem[];
  };
  about: {
    title: string;
    lead: string;
    paragraphs: string[];
    values: { title: string; text: string }[];
    numbers: { value: string; label: string }[];
  };
  contacts: {
    address: string;
    phone: string;
    phoneHref: string;
    email: string;
    telegram: string;
    telegramHref: string;
    whatsappHref: string;
    hours: string;
    mapNote: string;
    mapHref: string;
  };
  delivery: {
    lead: string;
    fee: number;
    freeFrom: number;
    intervalHours: number;
    minLeadHours: number;
    pickupAddress: string;
    pickupHours: string;
    timeSlots: string[];
    payment: string[];
    storage: string;
    notes: string[];
  };
  cta: {
    title: string;
    text: string;
    button: string;
  };
  footer: {
    note: string;
    demoNote: string;
  };
  legal: {
    consentText: string;
    privacyLead: string;
    privacySections: { title: string; text: string }[];
  };
}
