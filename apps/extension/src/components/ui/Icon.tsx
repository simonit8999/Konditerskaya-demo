import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/utils/cn';

/**
 * Набор контурных иконок (line art, 24×24, stroke 1.5, currentColor).
 * Один компонент вместо десятка файлов — цвет задаётся текстом (text-caramel и т.п.).
 */
export type IconName =
  | 'cake'
  | 'cupcake'
  | 'cream'
  | 'berries'
  | 'calculator'
  | 'telegram'
  | 'whatsapp'
  | 'max'
  | 'clock'
  | 'calendar'
  | 'palette'
  | 'cart'
  | 'heart'
  | 'check'
  | 'arrowRight'
  | 'chevronDown'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'truck'
  | 'mapPin'
  | 'phone'
  | 'mail'
  | 'sparkle'
  | 'gift'
  | 'leaf'
  | 'close'
  | 'menu'
  | 'copy'
  | 'download'
  | 'star'
  | 'info'
  | 'edit'
  | 'bell'
  | 'chart'
  | 'wallet'
  | 'user'
  | 'ban'
  | 'chat';

const ICONS: Record<IconName, ReactNode> = {
  cake: (
    <>
      <path d="M4 20.5h16" />
      <path d="M6 20.5V15a2.5 2.5 0 0 1 2.5-2.5h7A2.5 2.5 0 0 1 18 15v5.5" />
      <path d="M6 15.8c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0" />
      <path d="M12 12.5V8" />
      <path d="M12 8c1.1 0 1.6-.9 1.6-1.7C13.6 5.5 13 5 12 4c-1 1-1.6 1.5-1.6 2.3C10.4 7.1 10.9 8 12 8Z" />
    </>
  ),
  cupcake: (
    <>
      <path d="M6 10h12l-1.6 8.2a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8L6 10Z" />
      <path d="M6.2 10a3.8 3.8 0 0 1 3-6.2A4.2 4.2 0 0 1 17 4.4 3.6 3.6 0 0 1 17.8 10" />
      <path d="M12 4V2.5" />
    </>
  ),
  cream: (
    <>
      <path d="M12 3c2.5 3.4 4 5.7 4 7.6a4 4 0 0 1-8 0C8 8.7 9.5 6.4 12 3Z" />
      <path d="M9.2 14.5h5.6" />
    </>
  ),
  berries: (
    <>
      <circle cx="9.5" cy="14.5" r="3.5" />
      <circle cx="15.5" cy="16" r="2.5" />
      <path d="M9.5 11c0-2 1-3.6 2.8-4.6" />
      <path d="M12.3 6.4c1.6-1.2 3.2-1.4 4.6-1.1-.3 1.5-1.2 2.6-2.8 3.1" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <rect x="8" y="6" width="8" height="3.5" rx="1" />
      <path d="M9 13h.01M12 13h.01M15 13h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01" />
    </>
  ),
  telegram: (
    <>
      <path d="M21 4 3.5 10.8c-.7.3-.7 1.3 0 1.5l4.4 1.4 1.6 4.8c.2.7 1.1.9 1.6.3l2.4-2.7 4.2 3.1c.6.4 1.4.1 1.6-.6L21.4 5c.2-.8-.6-1.4-1.4-1Z" />
      <path d="m8.2 13.7 9.6-6.3-5.9 8.3" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20 11.6a8 8 0 0 1-11.9 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" />
      <path d="M9.2 9.2c.3 2.6 2.4 4.7 5 5 .5.1 1-.3 1.1-.8l.1-.6-1.7-.8-.7.8c-1-.4-1.9-1.3-2.3-2.3l.8-.7-.8-1.7-.6.1c-.5.1-.9.6-.9 1Z" />
    </>
  ),
  // MAX: скруглённый «пузырь» с буквой M — узнаваемый контур мессенджера.
  max: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="5" />
      <path d="M7.8 15.2V9l4.2 4.2L16.2 9v6.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3.2-3.6 3.2h-1.2c-1 0-1.7.9-1.7 1.9 0 .5.2.9.5 1.2.4.4.6.9.6 1.4 0 .8-.6 1.3-1.6 1.3H12Z" />
      <circle cx="8" cy="10" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="15.5" cy="9.5" r="1" />
      <circle cx="9" cy="14.5" r="1" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16h8.3a2 2 0 0 0 1.95-1.55L21 7H6" />
      <circle cx="9.5" cy="19.5" r="1.2" />
      <circle cx="17.5" cy="19.5" r="1.2" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19 10.7C19 15.6 12 20 12 20Z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
      <path d="M10.5 11v5M13.5 11v5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  truck: (
    <>
      <path d="M3 8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8H3V8Z" />
      <path d="M13 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6L16.5 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.2 5.4a1.7 1.7 0 0 0 2 0L20.2 7" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9 12 3.5Z" />,
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9C10.5 9 8 8.4 8 6.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1 4 1.5C16 8.4 13.5 9 12 9Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19c3-4 6-6 10-8" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 19h16" />
    </>
  ),
  star: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-7M12 20V6M17 20v-4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M16 14.5h2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 6 12 12" />
    </>
  ),
  chat: (
    <>
      <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 20l1.8-4.4A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Размер в пикселях; удобнее задавать через className (size-4, size-5). */
  size?: number;
}

export function Icon({ name, size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...rest}
    >
      {ICONS[name]}
    </svg>
  );
}
