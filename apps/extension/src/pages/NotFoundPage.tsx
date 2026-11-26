import { Link } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

/** 404: страница не найдена. */
export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <span className="font-display text-7xl font-semibold text-gold/60">404</span>
      <h1 className="mt-4 font-display text-2xl text-cocoa">Такой страницы нет, но торт — есть</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/70">
        Возможно, ссылка устарела. Вернитесь на главную или сразу соберите торт в конструкторе.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link to="/" className={buttonStyles('primary', 'md')}>
          На главную
        </Link>
        <Link to="/builder" className={buttonStyles('outline', 'md')}>
          <Icon name="cake" className="size-4" />
          В конструктор
        </Link>
      </div>
    </div>
  );
}
