import { cn } from '@/utils/cn';

/** Логотип: знак «торт со свечой в золотом кольце» + словесная марка. */
export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true" focusable="false">
        <circle cx="32" cy="32" r="30" fill="#FFF8E1" stroke="#DAA520" strokeWidth="2" />
        <path d="M19 45h26" stroke="#C68E17" strokeWidth="2.4" strokeLinecap="round" />
        <path
          d="M21 45V37.5A3.5 3.5 0 0 1 24.5 34h15A3.5 3.5 0 0 1 43 37.5V45"
          fill="#FFD1DC"
          stroke="#C68E17"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M21 40.6c2.2 1.9 4.4 1.9 6.6 0s4.4-1.9 6.6 0 4.4 1.9 6.6 0"
          fill="none"
          stroke="#FFF8E1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M32 34V25" stroke="#C68E17" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M32 25c2.7 0 3.9-2 3.9-4 0-2-1.5-3.3-3.9-5.8-2.4 2.5-3.9 3.8-3.9 5.8 0 2 1.2 4 3.9 4Z"
          fill="#DC143C"
        />
        <circle cx="25" cy="33" r="1.9" fill="#E0F2F1" stroke="#C68E17" strokeWidth="1.1" />
        <circle cx="39" cy="33" r="1.9" fill="#E0F2F1" stroke="#C68E17" strokeWidth="1.1" />
      </svg>

      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[17px] font-semibold text-cocoa">
            Кондитерский Рай
          </span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-caramel">
            Candys Paradise
          </span>
        </span>
      )}
    </span>
  );
}
