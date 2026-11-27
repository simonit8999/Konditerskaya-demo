import type { ContactChannel, ContactHandle } from '@/types';

/** Каналы связи в порядке показа в форме оформления. */
export const CONTACT_CHANNELS: { id: ContactChannel; label: string; placeholder: string }[] = [
  { id: 'telegram', label: 'Telegram', placeholder: '@anna' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: '+7 999 123-45-67' },
  { id: 'instagram', label: 'Instagram', placeholder: '@anna.cakes' },
  { id: 'vk', label: 'VK', placeholder: '@anna или vk.com/anna' },
  { id: 'other', label: 'Другое', placeholder: 'Как с вами связаться' },
];

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  vk: 'VK',
  other: 'Другое',
};

/** Убираем @ и пробелы — так удобнее собирать ссылку. */
export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, '');
}

/** Кликабельная ссылка на мессенджер (или null, если её не построить). */
export function buildMessengerLink(contact?: ContactHandle): string | null {
  if (!contact) return null;

  const raw = contact.handle.trim();
  if (!raw) return null;

  switch (contact.channel) {
    case 'telegram': {
      const nick = normalizeHandle(raw);
      return nick ? `https://t.me/${encodeURIComponent(nick)}` : null;
    }
    case 'whatsapp': {
      let digits = raw.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
      return digits.length >= 10 ? `https://wa.me/${digits}` : null;
    }
    case 'instagram': {
      const nick = normalizeHandle(raw);
      return nick ? `https://instagram.com/${encodeURIComponent(nick)}` : null;
    }
    case 'vk': {
      const nick = normalizeHandle(raw).replace(/^https?:\/\/(www\.)?vk\.com\//i, '');
      return nick ? `https://vk.com/${encodeURIComponent(nick)}` : null;
    }
    default:
      return null;
  }
}

/** Человекочитаемая подпись: «Telegram @anna». */
export function describeContact(contact?: ContactHandle): string {
  if (!contact || !contact.handle.trim()) return '';
  return `${CONTACT_CHANNEL_LABELS[contact.channel]}: ${contact.handle.trim()}`;
}

/**
 * Ссылка на Telegram-профиль с готовым черновиком сообщения.
 *
 * `?text=` открывает чат с уже заполненным полем ввода — человеку остаётся
 * нажать «Отправить». Это работает и в веб-версии, и в приложении.
 */
export function buildTelegramLink(handle: string, text?: string): string | null {
  const nick = normalizeHandle(handle)
    .replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, '')
    .replace(/\/+$/, '');
  if (!nick) return null;

  const base = `https://t.me/${encodeURIComponent(nick)}`;
  const message = text?.trim();
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Цифры номера в формате 7XXXXXXXXXX (8… → 7…, 10 цифр → +7…). */
function toCountryDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  return digits;
}

/**
 * Ссылка на профиль в MAX по номеру телефона: https://max.ru/u/+79204045880.
 * Формат проверен на веб-версии MAX: `u/` + номер в международном виде.
 */
export function buildMaxLink(phone: string): string | null {
  const digits = toCountryDigits(phone);
  return digits ? `https://max.ru/u/+${digits}` : null;
}

/** Ссылка «позвонить»: tel:+79204045880. */
export function buildTelLink(phone: string): string | null {
  const digits = toCountryDigits(phone);
  return digits ? `tel:+${digits}` : null;
}
