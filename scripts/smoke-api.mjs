/**
 * Smoke-тест заглушки API: /health + POST /api/send-order.
 * Запуск: node scripts/smoke-api.mjs [http://localhost:8787]
 *
 * Ожидаемый результат в режиме без токена Telegram:
 *   health { ok: true, mode: 'log' }
 *   send-order 200 { ok: true, mode: 'log' }
 */
const base = process.argv[2] ?? process.env.API_URL ?? 'http://localhost:8787';

const order = {
  id: 'order_smoke',
  number: 'KR-100001',
  items: [
    {
      id: 'cake_smoke',
      config: {
        sizeId: '2kg',
        baseId: 'honey',
        fillingId: 'berry',
        creamId: 'cheese',
        decorationIds: ['berries'],
        inscription: 'Happy birthday',
      },
      price: 7100,
      title: 'Торт 2 кг · Медовик',
      composition: ['Вес: 2 кг (10–14 порций)', 'Основа: Медовик', 'Начинка: Ягодная'],
    },
  ],
  customer: { name: 'Демо Клиент', phone: '+79990000000', email: 'demo@example.com' },
  delivery: {
    method: 'pickup',
    date: '2026-12-01',
    timeSlot: '12:00–14:00',
    comment: 'Свечи на 30',
  },
  subtotal: 7100,
  deliveryFee: 0,
  total: 7100,
  status: 'new',
  createdAt: new Date().toISOString(),
  syncStatus: 'demo',
};

try {
  const healthResponse = await fetch(`${base}/health`);
  const health = await healthResponse.json();
  console.log('health:', healthResponse.status, health);

  const response = await fetch(`${base}/api/send-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  const payload = await response.json();
  console.log('send-order:', response.status, payload);

  const ok = healthResponse.ok && health.ok === true && response.ok && payload.ok === true;
  console.log(ok ? '\nSMOKE API: OK' : '\nSMOKE API: FAILED');
  process.exitCode = ok ? 0 : 1;
} catch (error) {
  console.error('SMOKE API: FAILED —', error.message);
  console.error('Убедитесь, что API запущен: npm run dev:api');
  process.exitCode = 1;
}
