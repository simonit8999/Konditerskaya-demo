import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContactChoiceModal } from '@/components/seller/ContactChoiceModal';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { siteContent } from '@/references';

/** Нижний призыв: обсудить внедрение или посмотреть демо. */
export function CtaSection() {
  const { cta } = siteContent;
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="container-page py-12 lg:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-4xl border border-gold/40 bg-gold-gradient-soft px-6 py-10 shadow-gold sm:px-10">
          <span
            className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-cream/40 blur-2xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-blush/40 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl leading-tight text-cocoa-dark sm:text-3xl">
                {cta.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cocoa/80">{cta.text}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" size="lg" onClick={() => setContactOpen(true)}>
                <Icon name="telegram" className="size-5" />
                {cta.button}
              </Button>
              <Link to="/builder" className={buttonStyles('outline', 'lg')}>
                Посмотреть демо
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <ContactChoiceModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}

