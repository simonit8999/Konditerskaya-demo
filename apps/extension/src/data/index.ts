import { httpOrderRepository } from '@/data/http/orderRepository';
import { localOrderRepository } from '@/data/local/orderRepository';
import type { OrderRepository } from '@/data/types';

/**
 * Точка выбора хранилища.
 *
 *   VITE_DATA_SOURCE не задан / local -> localStorage (демо-режим);
 *   VITE_DATA_SOURCE=http          -> HTTP-адаптер (когда появится API + БД).
 *
 * Страницы работают только с контрактом OrderRepository, поэтому
 * переключение не требует правок UI.
 */
const dataSource = (import.meta.env.VITE_DATA_SOURCE ?? 'local').trim().toLowerCase();

export const orderRepository: OrderRepository =
  dataSource === 'http' ? httpOrderRepository : localOrderRepository;

export type { OrderDraft, OrderFilter, OrderRepository } from '@/data/types';
