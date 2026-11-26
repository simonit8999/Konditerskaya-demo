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
}

export interface CakeFilling {
  id: string;
  label: string;
  extraPrice: number;
  description: string;
  palette: { filling: string };
}

export interface CakeCream {
  id: string;
  label: string;
  extraPrice: number;
  description: string;
  palette: { cream: string };
}

export type DecorationPreviewType = 'berries' | 'figures' | 'sprinkles' | 'fondant' | 'cream';

export interface CakeDecoration {
  id: string;
  label: string;
  price: number;
  description: string;
  preview: { type: DecorationPreviewType };
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

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryInfo {
  method: DeliveryMethod;
  date: string;
  timeSlot: string;
  address?: string;
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

export type OrderStatus = 'new' | 'processing' | 'ready' | 'delivered';

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
