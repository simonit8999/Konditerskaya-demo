import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** При смене страницы прокручиваем наверх — иначе остаёмся в середине новой страницы. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
