import { Suspense } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageFallback } from '@/components/layout/PageFallback';
import { PageTransition } from '@/components/layout/PageTransition';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/** Каркас приложения: шапка, контент с переходом страниц, подвал, нижняя навигация. */
export function Layout() {
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollToTop />
      <Header />
      <OfflineBanner show={!online} />

      <main className="flex-1 pb-24 lg:pb-0">
        <Suspense fallback={<PageFallback />}>
          <PageTransition />
        </Suspense>
      </main>

      <Footer />
      <MobileNav />
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
}
