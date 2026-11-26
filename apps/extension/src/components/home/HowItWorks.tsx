import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { siteContent } from '@/references';

/** Как запускается витрина: три шага + что входит в платформу. */
export function HowItWorks() {
  const { steps, capabilities } = siteContent;

  return (
    <section className="container-page py-12 lg:py-16">
      <SectionTitle
        eyebrow="Как это работает"
        title="От заявки до первой заявки в Telegram"
        description="Настройка занимает один день: переносим ассортимент, включаем оплату при получении и подключаем бота."
      />

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.08} className="h-full">
            <article className="relative flex h-full flex-col rounded-3xl border border-line bg-gradient-to-b from-cream-50 to-blush-soft/40 p-6">
              <span className="font-display text-4xl font-semibold text-gold/70">
                0{index + 1}
              </span>
              <h3 className="mt-3 font-display text-lg text-cocoa">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.text}</p>
              {index < steps.length - 1 && (
                <Icon
                  name="arrowRight"
                  className="absolute -right-3 top-1/2 hidden size-6 -translate-y-1/2 text-gold/60 md:block"
                />
              )}
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6">
        <div className="rounded-3xl border border-mint-deep/60 bg-mint-soft p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <h3 className="font-display text-xl text-cocoa">Что входит в платформу</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Всё, что нужно для онлайн-заказов: витрина, конструктор, приём заказов и кабинет клиента.
              </p>
            </div>
            <ul className="grid flex-1 gap-2.5 sm:grid-cols-2">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-snug text-ink/80">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint-deep/40 text-cocoa">
                    <Icon name="check" className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
