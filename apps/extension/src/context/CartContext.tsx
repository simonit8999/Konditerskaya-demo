import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cakeData } from '@/references';
import type { CakeConfig, CartItem } from '@/types';
import { createId } from '@/utils/id';
import { calculatePrice } from '@/utils/priceCalculator';

const STORAGE_KEY = 'candys-paradise.cart.v1';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (config: CakeConfig) => CartItem;
  updateItem: (id: string, config: CakeConfig) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  getItem: (id: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEY, []);

  const addItem = useCallback(
    (config: CakeConfig): CartItem => {
      const item: CartItem = {
        id: createId('cake'),
        config,
        price: calculatePrice(config, cakeData).total,
        addedAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, item]);
      return item;
    },
    [setItems],
  );

  const updateItem = useCallback(
    (id: string, config: CakeConfig) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, config, price: calculatePrice(config, cakeData).total }
            : item,
        ),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const clear = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const getItem = useCallback((id: string) => items.find((item) => item.id === id), [items]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      subtotal,
      addItem,
      updateItem,
      removeItem,
      clear,
      getItem,
    }),
    [items, subtotal, addItem, updateItem, removeItem, clear, getItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart должен использоваться внутри CartProvider');
  return context;
}
