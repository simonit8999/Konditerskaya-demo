import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Конфигурация сборки PWA для GitHub Pages.
 *
 * base:
 *  - dev   -> "/"               (http://localhost:5173/)
 *  - build -> VITE_BASE_PATH    (по умолчанию "/candys-paradise/")
 *
 * В GitHub Actions переменная VITE_BASE_PATH выставляется как "/<имя-репозитория>/",
 * поэтому проект работает из подпапки https://<user>.github.io/<repo>/.
 * Для кастомного домена достаточно передать VITE_BASE_PATH="/".
 */
/**
 * Подставляет абсолютные адреса в OG-теги `index.html`.
 *
 * Краулеры мессенджеров не понимают относительные `og:image`/`og:url`,
 * а проект живёт в подпапке GitHub Pages. Адрес берём из `VITE_SITE_URL`
 * (его выставляет workflow), иначе — из `base`.
 */
function ogAbsoluteUrlsPlugin(base: string) {
  return {
    name: 'og-absolute-urls',
    transformIndexHtml(html: string) {
      const siteUrl = `${(process.env.VITE_SITE_URL ?? base).replace(/\/+$/, '')}/`;

      return html
        .replaceAll('__OG_URL__', siteUrl)
        .replaceAll('__OG_IMAGE__', `${siteUrl}og-image.png`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? process.env.VITE_BASE_PATH ?? '/candys-paradise/' : '/';

  return {
    base,
    plugins: [react(), ogAbsoluteUrlsPlugin(base)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Заглушка API (apps/api) слушает 8787 — реальная отправка заказа в Telegram.
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'dist',
      target: 'es2020',
      sourcemap: false,
      assetsInlineLimit: 2048,
      rollupOptions: {
        output: {
          // Вендоры в отдельных чанках: страницы грузятся лениво (см. App.tsx).
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('framer-motion') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) {
              return 'motion';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }
            return 'vendor';
          },
        },
      },
    },
  };
});
