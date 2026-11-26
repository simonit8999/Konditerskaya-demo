import { Spinner } from '@/components/ui/Spinner';

/** Заглушка на время загрузки чанка страницы (code-splitting). */
export function PageFallback() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <Spinner className="size-7" />
      <p className="text-sm text-ink/60">Загружаем витрину…</p>
    </div>
  );
}
