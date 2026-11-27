import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import type { Order, OrderStatus } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateRu, formatDateTimeRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { buildMessengerLink, describeContact } from '@/utils/messenger';
import { getOrderComment, hasAllergyWarning } from '@/utils/orderComment';
import {
  ORDER_STATUS_ACTIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '@/utils/orderStatus';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onSaveNote: (note: string) => void;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? 'font-semibold text-cocoa' : 'text-ink/60'}>{label}</dt>
      <dd
        className={
          strong
            ? 'font-display text-lg font-semibold text-caramel-dark'
            : 'font-semibold tabular-nums text-cocoa'
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** Детали заказа для владельца: состав, контакты, деньги, история, заметка и действия. */
export function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onSaveNote,
}: OrderDetailModalProps) {
  const [note, setNote] = useState(order.ownerNote ?? '');
  const comment = getOrderComment(order);
  const contactLabel = describeContact(order.customer.contact);
  const contactLink = buildMessengerLink(order.customer.contact);
  const { primary, decline, reopen } = ORDER_STATUS_ACTIONS[order.status];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Заказ ${order.number}`}
      footer={
        <div className="space-y-2">
          {primary && (
            <Button fullWidth onClick={() => onStatusChange(primary.status)}>
              <Icon name="check" className="size-4" />
              {primary.label}
            </Button>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {decline && (
              <Button variant="danger" fullWidth onClick={() => onStatusChange(decline.status)}>
                <Icon name="ban" className="size-4" />
                {decline.label}
              </Button>
            )}
            {reopen && (
              <Button variant="outline" fullWidth onClick={() => onStatusChange(reopen.status)}>
                <Icon name="edit" className="size-4" />
                {reopen.label}
              </Button>
            )}
          </div>

          <p className="text-center text-[11px] leading-relaxed text-ink/45">
            Клиент увидит новый статус на странице заказа. Уведомление появится в его браузере.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                ORDER_STATUS_STYLES[order.status],
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            {order.isDemo && <span className="chip">Демо-заказ</span>}
          </div>
          <p className="text-xs text-ink/55">Оформлен {formatDateTimeRu(order.createdAt)}</p>
        </div>

        <div className="rounded-2xl border border-line bg-cream-100/60 p-3.5 text-sm">
          <p className="font-semibold text-cocoa">{order.customer.name}</p>
          <p className="mt-0.5 text-xs text-ink/65">{order.customer.phone}</p>
          {order.customer.email && <p className="text-xs text-ink/65">{order.customer.email}</p>}
          {contactLabel && (
            <p className="mt-1 text-xs text-ink/65">
              Мессенджер:{' '}
              {contactLink ? (
                <a href={contactLink} target="_blank" rel="noreferrer" className="link-underline">
                  {contactLabel}
                </a>
              ) : (
                contactLabel
              )}
            </p>
          )}
          <p className="mt-2 text-xs leading-relaxed text-ink/65">
            {order.delivery.method === 'delivery'
              ? `Доставка · ${order.delivery.address ?? 'адрес не указан'}`
              : 'Самовывоз'}{' '}
            · {formatDateRu(order.delivery.date)}, {order.delivery.timeSlot}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
            Состав
          </p>
          <ul className="mt-2 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-line bg-cream-100/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-cocoa">{item.title}</p>
                  <p className="shrink-0 text-sm font-semibold text-caramel-dark">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-ink/65">
                  {item.composition.map((row) => (
                    <li key={row}>· {row}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {comment && (
          <div className="rounded-2xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-ink/75">
            <p className="flex items-center gap-1.5 font-semibold text-cocoa">
              <Icon name="chat" className="size-3.5 text-caramel" />
              Комментарий клиента
            </p>
            <p className="mt-1 whitespace-pre-line">{comment}</p>

            {hasAllergyWarning(comment) && (
              <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-berry/10 px-2.5 py-2 font-semibold text-berry-dark">
                <Icon name="ban" className="mt-0.5 size-3.5 shrink-0" />
                В комментарии есть ограничения по составу — подтвердите аллергены и декор перед
                готовкой.
              </p>
            )}
          </div>
        )}

        <dl className="space-y-1.5 rounded-2xl border border-line bg-cream-50 p-3.5 text-sm">
          <Row label="Сумма заказа" value={formatPrice(order.total)} />
          <Row label="Себестоимость ингредиентов" value={formatPrice(order.finance.itemsCost)} />
          <Row label="Упаковка" value={formatPrice(order.finance.packagingCost)} />
          <Row label="Себестоимость доставки" value={formatPrice(order.finance.deliveryCost)} />
          <Row label="Итого себестоимость" value={formatPrice(order.finance.costTotal)} />
          <Row label="Прибыль" value={formatPrice(order.finance.profit)} strong />
          <Row label="Маржа" value={`${order.finance.marginPercent}%`} />
        </dl>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
            История статусов
          </p>
          <ol className="mt-2 space-y-1.5">
            {order.statusHistory.map((event, index) => (
              <li
                key={`${event.at}-${index}`}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-ink/75">
                  {ORDER_STATUS_LABELS[event.status]}
                  <span className="text-ink/40">
                    {' · '}
                    {event.actor === 'owner'
                      ? 'владелец'
                      : event.actor === 'customer'
                        ? 'клиент'
                        : 'система'}
                  </span>
                </span>
                <span className="shrink-0 text-ink/45">{formatDateTimeRu(event.at)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <Textarea
            label="Заметка владельца"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="Например: согласован топпер, клиент заберёт в 15:00"
            hint="Видна только в кабинете владельца и не попадает в Telegram-сообщение."
          />
          <Button size="sm" variant="outline" className="mt-2" onClick={() => onSaveNote(note)}>
            <Icon name="check" className="size-3.5" />
            Сохранить заметку
          </Button>
        </div>
      </div>
    </Modal>
  );
}
