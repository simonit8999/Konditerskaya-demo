import { siteContent } from '@/references';

/** Политика конфиденциальности: демо-текст из siteContent.json. */
export function PrivacyPage() {
  const { legal } = siteContent;

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
          Политика обработки персональных данных
        </h1>
        <p className="mt-3 rounded-2xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink/70">
          {legal.privacyLead}
        </p>

        <div className="mt-6 space-y-5">
          {legal.privacySections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg text-cocoa">{section.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{section.text}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink/55">{legal.consentText}</p>
      </div>
    </div>
  );
}
