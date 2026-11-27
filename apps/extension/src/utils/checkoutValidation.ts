import { formatDateRu, isDateAllowed, minOrderDate, toISODate } from '@/utils/date';
import { COMMENT_MAX_LENGTH } from '@/utils/orderComment';
import { isPhoneComplete } from '@/utils/phone';
import type { ContactChannel, DeliveryMethod } from '@/types';

export interface CheckoutFormValues {
  name: string;
  phone: string;
  email: string;
  contactChannel: ContactChannel | '';
  contactHandle: string;
  method: DeliveryMethod;
  date: string;
  timeSlot: string;
  address: string;
  comment: string;
  consent: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE_MAX_LENGTH = 64;

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

  // Мессенджер необязателен, но канал и ник должны быть согласованы.
  const handle = values.contactHandle.trim();
  if (handle.length > HANDLE_MAX_LENGTH) {
    errors.contactHandle = `Ник — не больше ${HANDLE_MAX_LENGTH} символов`;
  } else if (handle && !values.contactChannel) {
    errors.contactHandle = 'Выберите мессенджер или очистите поле';
  } else if (values.contactChannel && !handle) {
    errors.contactHandle = 'Укажите ник или выберите «Не нужно»';
  }

  if (values.comment.length > COMMENT_MAX_LENGTH) {
    errors.comment = `Комментарий — не больше ${COMMENT_MAX_LENGTH} символов`;
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
