import '@fontsource/open-sans/cyrillic-400.css';
import '@fontsource/open-sans/cyrillic-600.css';
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/playfair-display/cyrillic-600.css';
import '@fontsource/playfair-display/cyrillic-700.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-700.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { applyOpenGraph, redirectLegacyParams } from '@/services/ogService';
import { registerServiceWorker } from '@/services/pwaService';
import './styles/index.css';

// Заголовок и OG-теги — до рендера React: превью и title не мигают.
applyOpenGraph();
// Старые ссылки вида ?admin=1 ведут в кабинет владельца через хэш-роутер.
redirectLegacyParams();

const container = document.getElementById('root');

if (!container) {
  throw new Error('Не найден контейнер #root в index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker только в production-сборке (см. pwaService).
registerServiceWorker();
