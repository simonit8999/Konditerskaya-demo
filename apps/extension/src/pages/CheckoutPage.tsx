import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { PriceTag } from '@/components/ui/PriceTag';
import { Textarea } from '@/components/ui/Textarea';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import { siteContent } from '@/references';
import type { DeliveryMethod, OrderItem } from '@/types';
import { describeCake } from '@/utils/cake';
import {
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFormValues,
} from '@/utils/checkoutValidation';
import { formatDateRu, minOrderDate, toISODate } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { formatPhone, PHONE_PLACEHOLDER } from '@/utils/phone';
import { cn } from '@/utils/cn';

export function CheckoutPage() {
  const { delivery } = siteContent;
  const { items, subtotal, clear } = useCart();
  const { placeOrder } = useOrders();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const earliestDate = toISODate(minOrderDate(delivery.minLeadHours));

  const [values, setValues] = useState<CheckoutFormValues>({
    name: '',
    phone: '',
    email: '',
    method: 'delivery',
    date: earliestDate,
    timeSlot: delivery.timeSlots[0] ?? '',
    address: '',
    comment: '',
    consent: false,
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});

  const deliveryFee =
    values.method === 'delivery' && subtotal < delivery.freeFrom ? delivery.fee : 0;
  const total = subtotal + deliveryFee;

  const update = <K extends keyof CheckoutFormValues,>(
    key: K,
    value: CheckoutFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateCheckout(values, { minLeadHours: delivery.minLeadHours });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast('Проверьте выделенные поля', 'error');
      return;
    }

    const orderItems: OrderItem[] = items.map((item) => {
      const description = describeCake(item.config);
      return {
        id: item.id,
        config: item.config,
        price: item.price,
        title: description.title,
        composition: description.composition,
      };
    });

    const order = placeOrder({
      items: orderItems,
      customer: {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
      },
      delivery: {
        method: values.method,
        date: values.date,
        timeSlot: values.timeSlot,
        address: values.method === 'delivery' ? values.address.trim() : undefined,
        comment: values.comment.trim() || undefined,
      },
      subtotal,
      deliveryFee,
    });

    clear();
    showToast('Заказ оформлен — мы свяжемся с вами');
    navigate(`/order/${order.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon="cart"
          title="Нечего оформлять"
          text="Корзина пуста. Соберите торт — и возвращайтесь к оформлению."
          action={
            <Link to="/builder" className={buttonStyles('primary', 'md')}>
              <Icon name="cake" className="size-4" />
              Собрать торт
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-xs text-ink/50">
        <Link to="/cart" className="transition-colors hover:text-caramel-dark">
          Корзина
        </Link>{' '}
        / <span className="text-ink/70">Оформление</span>
      </nav>

      <div className="mt-3">
        <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
          Оформление заказа
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          Осталось несколько данных — и мы передадим заказ кондитеру.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-3xl border border-line bg-cream-50/80 p-5 shadow-innerLine">
            <h2 className="font-display text-lg text-cocoa">1. Контакты</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Ваше имя"
                placeholder="Анна"
                value={values.name}
                onChange={(event) => update('name', event.target.value)}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                label="Ваш телефон (для связи)"
                placeholder={PHONE_PLACEHOLDER}
                value={values.phone}
                onChange={(event) => update('phone', formatPhone(event.target.value))}
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Ваш Email (необязательно)"
                  placeholder="anna@example.com"
                  type="email"
                  value={values.email}
                  onChange={(event) => update('email', event.target.value)}
                  error={errors.email}
                  autoComplete="email"
                  hint="Пришлём подтверждение заказа, если укажете"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-cream-50/80 p-5 shadow-innerLine">
            <h2 className="font-display text-lg text-cocoa">2. Получение</h2>

            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Способ получения">
              {[
                {
                  id: 'delivery',
                  title: 'Доставка',
                  text: `По городу · ${formatPrice(delivery.fee)}, бесплатно от ${formatPrice(delivery.freeFrom)}`,
                  icon: 'truck',
                },
                { id: 'pickup', title: 'Самовывоз', text: delivery.pickupAddress, icon: 'mapPin' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={values.method === option.id}
                  onClick={() => update('method', option.id as DeliveryMethod)}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    values.method === option.id
                      ? 'border-caramel bg-gold/10'
                      : 'border-line bg-cream-50 hover:border-caramel/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      values.method === option.id
                        ? 'bg-caramel text-white'
                        : 'bg-cream-200 text-caramel',
                    )}
                  >
                    <Icon name={option.icon as IconName} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-cocoa">{option.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink/60">
                      {option.text}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Желаемая дата получения"
                type="date"
                min={earliestDate}
                value={values.date}
                onChange={(event) => update('date', event.target.value)}
                error={errors.date}
                hint={`Готовим минимум за ${delivery.minLeadHours} ч · ${formatDateRu(values.date)}`}
              />
              <div>
                <span className="field-label">Интервал</span>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Интервал получения">
                  {delivery.timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      role="radio"
                      aria-checked={values.timeSlot === slot}
                      onClick={() => update('timeSlot', slot)}
                      className={cn(
                        'rounded-xl border px-2 py-2 text-xs font-semibold transition-colors',
                        values.timeSlot === slot
                          ? 'border-caramel bg-gold/15 text-cocoa'
                          : 'border-line bg-cream-50 text-ink/70 hover:border-caramel/40',
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.timeSlot && <p className="field-error">{errors.timeSlot}</p>}
              </div>
            </div>

            {values.method === 'delivery' ? (
              <div className="mt-4">
                <Input
                  label="Адрес доставки (если применимо)"
                  placeholder="Улица, дом, квартира, подъезд"
                  value={values.address}
                  onChange={(event) => update('address', event.target.value)}
                  error={errors.address}
                  autoComplete="street-address"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-mint-soft px-4 py-3 text-xs leading-relaxed text-ink/70">
                <p className="font-semibold text-cocoa">Забрать самостоятельно</p>
                <p className="mt-1">{delivery.pickupAddress}</p>
                <p>{delivery.pickupHours}</p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-cream-50/80 p-5 shadow-innerLine">
            <h2 className="font-display text-lg text-cocoa">3. Пожелания</h2>
            <div className="mt-4">
              <Textarea
                label="Комментарии к заказу"
                placeholder="Например: без орехов, свечи на 30, позвонить за час"
                value={values.comment}
                onChange={(event) => update('comment', event.target.value)}
                maxLength={500}
              />
            </div>
            <div className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink/70">
              <p className="flex items-center gap-1.5 font-semibold text-cocoa">
                <Icon name="info" className="size-3.5 text-caramel" />
                Оплата
              </p>
              <ul className="mt-1.5 space-y-1">
                {delivery.payment.map((option) => (
                  <li key={option}>· {option}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="space-y-3 rounded-3xl border border-line bg-cream-50 p-5">
            <Checkbox
              checked={values.consent}
              onChange={(event) => update('consent', event.target.checked)}
              error={errors.consent}
              label={
                <span>
                  {siteContent.legal.consentText}{' '}
                  <Link to="/privacy" className="link-underline">
                    Политика
                  </Link>
                </span>
              }
            />
            <Button type="submit" size="lg" fullWidth>
              <Icon name="check" className="size-5" />
              Подтвердить заказ · {formatPrice(total)}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-ink/50">
              Мы не берём предоплату. Заказ уйдёт кондитеру в Telegram.
            </p>
          </div>
        </div>

        <aside>
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
              <h2 className="font-display text-lg text-cocoa">Ваш заказ</h2>
              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-cocoa">{describeCake(item.config).title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink/55">
                        {describeCake(item.config).shortLine}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-cocoa">
                      {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t border-line/70 pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink/65">Сумма</dt>
                  <dd className="font-semibold tabular-nums text-cocoa">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink/65">
                    {values.method === 'delivery' ? 'Доставка' : 'Самовывоз'}
                  </dt>
                  <dd className="font-semibold text-cocoa">
                    {deliveryFee > 0 ? formatPrice(deliveryFee) : 'бесплатно'}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-end justify-between gap-3 border-t border-line/70 pt-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Итого</p>
                <PriceTag
                  value={total}
                  className="font-display text-2xl font-semibold text-caramel-dark"
                />
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-ink/50">{delivery.storage}</p>
            </div>

            <Link to="/cart" className={buttonStyles('outline', 'md', true)}>
              Вернуться в корзину
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
