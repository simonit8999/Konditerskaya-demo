import type {
  ActorRole,
  CustomerInfo,
  DeliveryInfo,
  Order,
  OrderItem,
  OrderStatus,
  SyncStatus,
} from '@/types';

export interface OrderFilter {
  status?: OrderStatus;
  /** Поиск по номеру, имени клиента или телефону. */
  search?: string;
}

/** Черновик заказа: всё, что клиент заполнил в оформлении. */
export interface OrderDraft {
  items: OrderItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
  comment?: string;
}

/**
 * Контракт хранилища заказов.
 *
 * Сейчас используется localStorage-адаптер (data/local), позже —
 * HTTP-адаптер к API и PostgreSQL без переписывания страниц
 * (см. docs/database-schema.md). Переключение — VITE_DATA_SOURCE=http.
 */
export interface OrderRepository {
  /** Быстрый синхронный старт из localStorage (чтобы не мигал пустой экран). */
  listSync(): Order[];
  /** Подписка на изменения: своя вкладка и событие storage в других вкладках. */
  subscribe?(listener: (orders: Order[]) => void): () => void;
  list(filter?: OrderFilter): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  create(draft: OrderDraft): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, actor: ActorRole, note?: string): Promise<Order>;
  updateNote(id: string, note: string): Promise<Order>;
  updateSync(id: string, syncStatus: SyncStatus, syncError?: string): Promise<Order>;
  remove(id: string): Promise<void>;
  seedDemo?(): Promise<Order[]>;
}
