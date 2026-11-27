import { describe, expect, it } from 'vitest';
import {
  validateCheckout,
  type CheckoutFormValues,
} from '@/utils/checkoutValidation';

const baseValues: CheckoutFormValues = {
  name: 'Анна',
  phone: '+7 (999) 123-45-67',
  email: '',
  contactChannel: '',
  contactHandle: '',
  method: 'pickup',
  date: '2099-01-01',
  timeSlot: '12:00–14:00',
  address: '',
  comment: '',
  consent: true,
};

const options = { minLeadHours: 24 };

describe('validateCheckout', () => {
  it('пропускает корректную форму без мессенджера', () => {
    expect(validateCheckout(baseValues, options)).toEqual({});
  });

  it('пропускает заполненный мессенджер', () => {
    const errors = validateCheckout(
      { ...baseValues, contactChannel: 'telegram', contactHandle: '@anna' },
      options,
    );

    expect(errors).toEqual({});
  });

  it('требует канал, если ник заполнен', () => {
    const errors = validateCheckout({ ...baseValues, contactHandle: '@anna' }, options);

    expect(errors.contactHandle).toBe('Выберите мессенджер или очистите поле');
  });

  it('требует ник, если выбран канал', () => {
    const errors = validateCheckout({ ...baseValues, contactChannel: 'whatsapp' }, options);

    expect(errors.contactHandle).toBe('Укажите ник или выберите «Не нужно»');
  });

  it('ограничивает ник 64 символами', () => {
    const errors = validateCheckout(
      {
        ...baseValues,
        contactChannel: 'other',
        contactHandle: 'а'.repeat(65),
      },
      options,
    );

    expect(errors.contactHandle).toContain('64');
  });

  it('ограничивает комментарий 500 символами', () => {
    const errors = validateCheckout({ ...baseValues, comment: 'я'.repeat(501) }, options);

    expect(errors.comment).toContain('500');
  });

  it('сохраняет прежние обязательные правила', () => {
    const errors = validateCheckout(
      {
        ...baseValues,
        name: '',
        phone: '',
        email: 'ошибка',
        date: '',
        timeSlot: '',
        consent: false,
      },
      options,
    );

    expect(errors.name).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.date).toBeDefined();
    expect(errors.timeSlot).toBeDefined();
    expect(errors.consent).toBeDefined();
  });

  it('требует адрес для доставки', () => {
    const errors = validateCheckout(
      { ...baseValues, method: 'delivery', address: 'ул.' },
      options,
    );

    expect(errors.address).toBeDefined();
  });
});
