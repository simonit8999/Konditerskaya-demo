import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDemoMode, sendOrder } from '@/services/ordersService';
import type {
  CustomerInfo,
  DeliveryInfo,
  Order,
  OrderItem,
  OrderStatus,
} from '@/types';
import { createId, createOrderNumber } from '@/utils/id';

const STORAGE_KEY = 'candys-paradise.orders.v1';

export interface OrderDraft {
  items: OrderItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
}

interface OrdersContextValue {
  orders: Order[];
  placeOrder: (draft: OrderDraft) => Order;
  retrySend: (orderId: string) => Promise<boolean>;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
  removeOrder: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useLocalStorage<Order[]>(STORAGE_KEY, []);

  const placeOrder = useCallback(
    (draft: OrderDraft): Order => {
      const order: Order = {
        id: createId('order'),
        number: createOrderNumber(),
        status: 'new',
        createdAt: new Date().toISOString(),
        syncStatus: isDemoMode ? 'demo' : 'sent',
        items: draft.items,
        customer: draft.customer,
        delivery: draft.delivery,
        subtotal: draft.subtotal,
        deliveryFee: draft.deliveryFee,
        total: draft.subtotal + draft.deliveryFee,
      };

      setOrders((prev) => [order, ...prev]);

      // Отправка не блокирует оформление: заказ уже сохранён на устройстве.
      void sendOrder(order).then((result) => {
        setOrders((prev) =>
          prev.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  syncStatus: result.ok ? (result.mode === 'telegram' ? 'sent' : 'demo') : 'failed',
                  syncError: result.ok ? undefined : result.error,
                }
              : item,
          ),
        );
      });

      return order;
    },
    [setOrders],
  );

  const retrySend = useCallback(
    async (orderId: string): Promise<boolean> => {
      const target = orders.find((order) => order.id === orderId);
      if (!target) return false;

      const result = await sendOrder(target);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                syncStatus: result.ok ? (result.mode === 'telegram' ? 'sent' : 'demo') : 'failed',
                syncError: result.ok ? undefined : result.error,
              }
            : order,
        ),
      );

      return result.ok;
    },
    [orders, setOrders],
  );

  const updateStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order)),
      );
    },
    [setOrders],
  );

  const removeOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    },
    [setOrders],
  );

  const getOrder = useCallback((id: string) => orders.find((order) => order.id === id), [orders]);

  const value = useMemo(
    () => ({ orders, placeOrder, retrySend, updateStatus, getOrder, removeOrder }),
    [orders, placeOrder, retrySend, updateStatus, getOrder, removeOrder],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders должен использоваться внутри OrdersProvider');
  return context;
}
