import type { OrderRepository } from '@/data/types';

/**
 * Заглушка будущего HTTP-репозитория.
 *
 * Контракт и схема БД описаны в docs/database-schema.md. Когда появится API:
 *   1. реализуйте методы через fetch к /api/orders;
 *   2. включите адаптер через VITE_DATA_SOURCE=http.
 *
 * До этого адаптер намеренно падает с понятной ошибкой, чтобы данные
 * не «пропали» молча из-за неправильной переменной окружения.
 */
function notConnected(): never {
  throw new Error(
    'HTTP-хранилище не подключено. Оставьте VITE_DATA_SOURCE=local или реализуйте API по docs/database-schema.md.',
  );
}

export const httpOrderRepository: OrderRepository = {
  listSync: () => [],
  async list() {
    return notConnected();
  },
  async get() {
    return notConnected();
  },
  async create() {
    return notConnected();
  },
  async updateStatus() {
    return notConnected();
  },
  async updateNote() {
    return notConnected();
  },
  async updateSync() {
    return notConnected();
  },
  async remove() {
    notConnected();
  },
};
