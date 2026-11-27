import type { AssistantAnswers, AssistantOption } from '@/utils/cakeAssistant';
import { recommendCakes } from '@/utils/cakeAssistant';

/**
 * Интерфейс помощника по сборке торта.
 *
 * Сейчас isLive = false: рекомендации считаются локально по правилам
 * (utils/cakeAssistant.ts). Когда появится LLM, реализация заменится на
 * вызов backend-proxy, а контракт и промпт описаны в docs/ai-cake-assistant.md.
 * Ключ API должен жить только на сервере — не в PWA.
 */
export interface AssistantService {
  isLive: boolean;
  recommend(answers: AssistantAnswers): Promise<AssistantOption[]>;
}

export const assistantService: AssistantService = {
  isLive: false,
  async recommend(answers) {
    return recommendCakes(answers);
  },
};
