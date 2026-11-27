import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { siteContent } from '@/references';
import { buildMaxLink, buildTelLink, buildTelegramLink } from '@/utils/messenger';
import { parseShopParam } from '@/utils/og';

interface ContactChoiceModalProps {
  open: boolean;
  onClose: () => void;
}

const ROW_CLASS =
  'flex items-center gap-3 rounded-2xl border border-line bg-cream-100/60 px-4 py-3 transition-colors';
const ICON_WRAP_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-full bg-blush-soft text-caramel';

/**
 * Выбор канала связи с автором приложения (продавцом витрины).
 *
 * Контакты демо-кондитерской лежат в `siteContent.contacts` и здесь не
 * используются — это отдельный блок `siteContent.seller`. В черновик сообщения
 * подставляется название магазина из `?shop=`, чтобы автор сразу видел,
 * какая кондитерская смотрела демо.
 */
export function ContactChoiceModal({ open, onClose }: ContactChoiceModalProps) {
  const { seller } = siteContent;
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const shop =
    typeof window === 'undefined'
      ? null
      : parseShopParam(window.location.search, window.location.hash);

  const prefill = shop
    ? `${seller.prefill} Смотрел(а) демо для «${shop}».`
    : seller.prefill;

  const telegramHref = buildTelegramLink(seller.telegram, prefill) ?? seller.telegramHref;
  const maxHref = buildMaxLink(seller.max) ?? seller.maxHref;
  const phoneHref = buildTelLink(seller.max) ?? seller.phoneHref;

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard недоступен');
      await navigator.clipboard.writeText(seller.max);
      setCopied(true);
      showToast('Номер скопирован');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`Скопируйте номер вручную: ${seller.max}`, 'error');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Хочу так же"
      footer={
        <p className="text-[11px] leading-relaxed text-ink/50">
          Отвечает лично {seller.name} — автор приложения. Покажу демо и подскажу, что нужно
          подготовить для запуска.
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-ink/75">
          Напишите в удобный мессенджер — обсудим вашу кондитерскую, ассортимент и запуск витрины.
        </p>

        {shop && (
          <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-caramel-dark">
            <Icon name="star" className="size-3.5" />
            Демо для «{shop}»
          </p>
        )}

        <a
          href={telegramHref}
          target="_blank"
          rel="noreferrer"
          className={`${ROW_CLASS} hover:border-caramel`}
        >
          <span className={ICON_WRAP_CLASS}>
            <Icon name="telegram" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-cocoa">Telegram</span>
            <span className="block truncate text-xs text-ink/60">
              {seller.telegram} · сообщение уже готово
            </span>
          </span>
          <Icon name="arrowRight" className="size-4 shrink-0 text-ink/40" />
        </a>

        <div className={ROW_CLASS}>
          <span className={ICON_WRAP_CLASS}>
            <Icon name="max" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cocoa">MAX</p>
            <p className="truncate text-xs text-ink/60">{seller.max}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleCopy()}
              aria-label={copied ? 'Номер скопирован' : 'Скопировать номер'}
              title="Скопировать номер"
              className="rounded-full border border-line bg-cream-50 p-2 text-caramel transition-colors hover:border-caramel hover:text-cocoa"
            >
              <Icon name={copied ? 'check' : 'copy'} className="size-4" />
            </button>
            <a
              href={maxHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gold-gradient px-3 py-2 text-xs font-semibold text-cocoa-dark shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Написать
            </a>
          </div>
        </div>

        <a href={phoneHref} className={`${ROW_CLASS} hover:border-caramel`}>
          <span className={ICON_WRAP_CLASS}>
            <Icon name="phone" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-cocoa">Телефон</span>
            <span className="block truncate text-xs text-ink/60">{seller.max}</span>
          </span>
          <Icon name="arrowRight" className="size-4 shrink-0 text-ink/40" />
        </a>

        <p className="text-[11px] leading-relaxed text-ink/45">
          Ссылки открываются в новом окне: Telegram — с черновиком сообщения, MAX — с профилем по
          номеру. Если MAX не установлен, номер можно скопировать и отправить вручную.
        </p>
      </div>
    </Modal>
  );
}
