import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { businessSettings, siteContent } from '@/references';

interface AdminLoginProps {
  onLogin: (pin: string) => boolean;
}

/** Демо-вход в кабинет владельца: PIN уже подставлен, достаточно нажать «Войти». */
export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [pin, setPin] = useState(businessSettings.owner.pin);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onLogin(pin)) {
      setError('Неверный PIN. Попробуйте ещё раз.');
      return;
    }

    setError('');
  };

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-cream-50 p-6 shadow-card">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold/15 text-caramel-dark">
          <Icon name="wallet" className="size-6" />
        </span>

        <h1 className="mt-4 font-display text-2xl text-cocoa">Кабинет владельца</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Это демо-версия. Полноценная версия будет доступна после согласования с программистом —{' '}
          <a
            href={siteContent.seller.telegramHref}
            target="_blank"
            rel="noreferrer"
            className="link-underline font-semibold"
          >
            {siteContent.seller.telegram}
          </a>
          .
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            label="PIN"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setError('');
            }}
            error={error}
            placeholder="••••"
          />
          <Button type="submit" size="lg" fullWidth>
            <Icon name="user" className="size-4" />
            Войти
          </Button>
        </form>

        <p className="mt-4 rounded-2xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-ink/60">
          Демо-PIN: <strong className="text-cocoa">{businessSettings.owner.pin}</strong> (при
          создании приложения под вас у вас будет персональный пин-код)
        </p>
      </div>
    </div>
  );
}
