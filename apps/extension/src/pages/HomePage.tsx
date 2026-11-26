import { CtaSection } from '@/components/home/CtaSection';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { GallerySection } from '@/components/home/GallerySection';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';

/** Главная: B2B-оффер, преимущества, как это работает, витрина работ, CTA. */
export function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <GallerySection />
      <CtaSection />
    </>
  );
}
