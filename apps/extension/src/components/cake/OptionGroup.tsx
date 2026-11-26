import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface OptionGroupProps {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}

/** Секция-шаг конструктора: заголовок с номером + сетка опций. */
export function OptionGroup({ step, title, hint, children }: OptionGroupProps) {
  return (
    <section
      className="rounded-3xl border border-line bg-cream-50/80 p-4 shadow-innerLine sm:p-5"
      aria-labelledby={`builder-step-${step}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[11px] font-bold text-caramel-dark">
          {step}
        </span>
        <div>
          <h3 id={`builder-step-${step}`} className="font-display text-lg leading-snug text-cocoa">
            {title}
          </h3>
          {hint && <p className="mt-1 text-xs leading-relaxed text-ink/60">{hint}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  meta?: string;
  badge?: string;
  color?: string;
  role?: 'radio' | 'checkbox';
}

/** Карточка выбора: вес, основа, начинка, крем, декор. */
export function OptionCard({
  selected,
  onSelect,
  label,
  description,
  meta,
  badge,
  color,
  role = 'radio',
}: OptionCardProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ease-silk',
        selected
          ? 'border-caramel bg-gold/10 shadow-[0_0_0_1px_rgba(198,142,23,0.35)]'
          : 'border-line bg-cream-50 hover:-translate-y-0.5 hover:border-caramel/45 hover:shadow-card',
      )}
    >
      {color && (
        <span
          className="mt-0.5 size-7 shrink-0 rounded-full border border-black/5"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-cocoa">{label}</span>
          {badge && (
            <span className="rounded-full bg-berry/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-berry-dark">
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-ink/60">{description}</span>
        )}
        {meta && <span className="mt-1.5 block text-xs font-semibold text-caramel-dark">{meta}</span>}
      </span>

      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-caramel bg-caramel text-white'
            : 'border-line bg-cream-50 text-transparent group-hover:border-caramel/50',
        )}
        aria-hidden="true"
      >
        <Icon name="check" className="size-3" />
      </span>
    </button>
  );
}
