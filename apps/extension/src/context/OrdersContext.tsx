import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { orderRepository } from '@/data';
import type { OrderDraft } from '@/data/types';
import { sendOrder } from '@/services/ordersService';
import type { Order, OrderStatus } from '@/types';

interface OrdersContextValue {
  orders: Order[];
  /** Первичная загрузка из репозитория (для будущего HTTP-адаптера). */
  loading: boolean;
  placeOrder: (draft: OrderDraft) => Promise<Order>;
  retrySend: (orderId: string) => Promise<boolean>;
  updateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateNote: (orderId: string, note: string) => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  removeOrder: (orderId: string) => Promise<void>;
  seedDemo: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

/**
 * Заказы приложения. Источник данных скрыт за OrderRepository
 * (localStorage сейчас, HTTP + PostgreSQL — позже, см. docs/database-schema.md).
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => orderRepository.listSync());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Синхронный кэш уже отрисован — догружаем актуальные данные.
    setOrders(orderRepository.listSync());
    orderRepository
      .list()
      .then((list) => {
        if (active) {
          setOrders(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = orderRepository.subscribe?.((list) => {
      if (active) setOrders(list);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const placeOrder = useCallback(async (draft: OrderDraft): Promise<Order> => {
    const order = await orderRepository.create(draft);
    setOrders(orderRepository.listSync());

    // Отправка не блокирует оформление: заказ уже сохранён на устройстве.
    void sendOrder(order).then(async (result) => {
      const syncStatus = result.ok ? (result.mode === 'telegram' ? 'sent' : 'demo') : 'failed';
      await orderRepository.updateSync(order.id, syncStatus, result.ok ? undefined : result.error);
      setOrders(orderRepository.listSync());
    });

    return order;
  }, []);

  const retrySend = useCallback(async (orderId: string): Promise<boolean> => {
    const target = orderRepository.listSync().find((order) => order.id === orderId);
    if (!target) return false;

    const result = await sendOrder(target);
    await orderRepository.updateSync(
      orderId,
      result.ok ? (result.mode === 'telegram' ? 'sent' : 'demo') : 'failed',
      result.ok ? undefined : result.error,
    );
    setOrders(orderRepository.listSync());

    return result.ok;
  }, []);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      await orderRepository.updateStatus(orderId, status, 'owner', note);
      setOrders(orderRepository.listSync());
    },
    [],
  );

  const updateNote = useCallback(async (orderId: string, note: string) => {
    await orderRepository.updateNote(orderId, note);
    setOrders(orderRepository.listSync());
  }, []);

  const removeOrder = useCallback(async (orderId: string) => {
    await orderRepository.remove(orderId);
    setOrders(orderRepository.listSync());
  }, []);

  const seedDemo = useCallback(async () => {
    await orderRepository.seedDemo?.();
    setOrders(orderRepository.listSync());
  }, []);

  const getOrder = useCallback((id: string) => orders.find((order) => order.id === id), [orders]);

  const value = useMemo(
    () => ({
      orders,
      loading,
      placeOrder,
      retrySend,
      updateStatus,
      updateNote,
      getOrder,
      removeOrder,
      seedDemo,
    }),
    [
      orders,
      loading,
      placeOrder,
      retrySend,
      updateStatus,
      updateNote,
      getOrder,
      removeOrder,
      seedDemo,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders должен использоваться внутри OrdersProvider');
  return context;
}

export type { OrderDraft } from '@/data/types';
