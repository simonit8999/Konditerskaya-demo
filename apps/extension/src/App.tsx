import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CartProvider } from '@/context/CartContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Страницы грузятся лениво: первый экран не тянет весь код витрины.
 * Это заметно ускоряет установку PWA и повторные заходы.
 */
const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const BuilderPage = lazy(() =>
  import('@/pages/BuilderPage').then((module) => ({ default: module.BuilderPage })),
);
const CartPage = lazy(() =>
  import('@/pages/CartPage').then((module) => ({ default: module.CartPage })),
);
const CheckoutPage = lazy(() =>
  import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })),
);
const OrderSuccessPage = lazy(() =>
  import('@/pages/OrderSuccessPage').then((module) => ({ default: module.OrderSuccessPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })),
);
const ContactsPage = lazy(() =>
  import('@/pages/ContactsPage').then((module) => ({ default: module.ContactsPage })),
);
const DeliveryPage = lazy(() =>
  import('@/pages/DeliveryPage').then((module) => ({ default: module.DeliveryPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

/**
 * Корневой компонент.
 *
 * HashRouter выбран сознательно: GitHub Pages не умеет SPA-fallback,
 * а хэш-роутинг работает и на подпапке (/repo/), и офлайн через service worker.
 */
export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <OrdersProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="builder" element={<BuilderPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order/:id" element={<OrderSuccessPage />} />
                <Route path="orders" element={<DashboardPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </OrdersProvider>
      </CartProvider>
    </ToastProvider>
  );
}
