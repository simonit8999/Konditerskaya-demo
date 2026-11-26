import { formatDateRu, isDateAllowed, minOrderDate, toISODate } from '@/utils/date';
import { isPhoneComplete } from '@/utils/phone';
import type { DeliveryMethod } from '@/types';

export interface CheckoutFormValues {
  name: string;
  phone: string;
  email: string;
  method: DeliveryMethod;
  date: string;
  timeSlot: string;
  address: string;
  comment: string;
  consent: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Валидация формы оформления заказа (без сторонних схем). */
export function validateCheckout(
  values: CheckoutFormValues,
  options: { minLeadHours: number },
): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Укажите имя — так мы знаем, к кому обращаться';
  }

  if (!isPhoneComplete(values.phone)) {
    errors.phone = 'Введите телефон полностью: +7 (999) 123-45-67';
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Проверьте email: похоже, в адресе опечатка';
  }

  if (!values.date) {
    errors.date = 'Выберите дату получения';
  } else if (!isDateAllowed(values.date, options.minLeadHours)) {
    const earliest = toISODate(minOrderDate(options.minLeadHours));
    errors.date = `Ближайшая доступная дата — ${formatDateRu(earliest)}`;
  }

  if (!values.timeSlot) {
    errors.timeSlot = 'Выберите удобный интервал';
  }

  if (values.method === 'delivery' && values.address.trim().length < 5) {
    errors.address = 'Укажите улицу, дом и квартиру — курьеру нужно знать, куда ехать';
  }

  if (!values.consent) {
    errors.consent = 'Без согласия на обработку данных мы не сможем оформить заказ';
  }

  return errors;
}
