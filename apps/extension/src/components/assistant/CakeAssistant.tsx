import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { assistantService } from '@/services/assistantService';
import type { CakeConfig } from '@/types';
import type {
  AssistantAnswers,
  AssistantOccasion,
  AssistantOption,
  AssistantRestriction,
  AssistantStyle,
  AssistantTaste,
} from '@/utils/cakeAssistant';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';

const OCCASIONS: { id: AssistantOccasion; label: string }[] = [
  { id: 'birthday', label: 'День рождения' },
  { id: 'kids', label: 'Детский праздник' },
  { id: 'wedding', label: 'Свадьба' },
  { id: 'corporate', label: 'Корпоратив' },
  { id: 'anniversary', label: 'Годовщина' },
];

const TASTES: { id: AssistantTaste; label: string }[] = [
  { id: 'chocolate', label: 'Шоколад' },
  { id: 'berry', label: 'Ягоды' },
  { id: 'caramel', label: 'Карамель' },
  { id: 'fruit', label: 'Фрукты' },
  { id: 'unsure', label: 'Не знаю' },
];

const RESTRICTIONS: { id: AssistantRestriction; label: string }[] = [
  { id: 'nuts', label: 'Орехи' },
  { id: 'lactose', label: 'Лактоза' },
  { id: 'gluten', label: 'Глютен' },
  { id: 'fondant', label: 'Без мастики' },
  { id: 'berries', label: 'Ягоды' },
  { id: 'dyes', label: 'Красители' },
];

const STYLES: { id: AssistantStyle; label: string }[] = [
  { id: 'minimal', label: 'Минимализм' },
  { id: 'classic', label: 'Классика' },
  { id: 'bright', label: 'Яркий' },
  { id: 'themed', label: 'Тематический' },
];

const CHIP = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
    active
      ? 'border-caramel bg-gold/20 text-cocoa'
      : 'border-line bg-cream-50 text-ink/70 hover:border-caramel/40',
  );

interface ChoiceProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Choice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={CHIP(value === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CakeAssistantProps {
  open: boolean;
  onClose: () => void;
  onApply: (config: CakeConfig) => void;
}

/** Демо-помощник «Помогите выбрать»: вопросы → 2–3 варианта → перенос в конструктор. */
export function CakeAssistant({ open, onClose, onApply }: CakeAssistantProps) {
  const [answers, setAnswers] = useState<AssistantAnswers>({
    occasion: 'birthday',
    guests: 10,
    taste: 'berry',
    restrictions: [],
    style: 'classic',
    budget: 5000,
  });
  const [options, setOptions] = useState<AssistantOption[]>([]);
  const [loading, setLoading] = useState(false);

  const patch = <K extends keyof AssistantAnswers,>(key: K, value: AssistantAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRestriction = (restriction: AssistantRestriction) => {
    setAnswers((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter((item) => item !== restriction)
        : [...prev.restrictions, restriction],
    }));
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      setOptions(await assistantService.recommend(answers));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Помогите выбрать торт">
      <div className="space-y-4">
        <Choice
          label="Повод"
          options={OCCASIONS}
          value={answers.occasion}
          onChange={(value) => patch('occasion', value)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Сколько гостей"
            type="number"
            min={1}
            max={200}
            value={String(answers.guests)}
            onChange={(event) => patch('guests', Number(event.target.value) || 1)}
          />
          <Input
            label="Бюджет, ₽"
            type="number"
            min={0}
            step={500}
            value={String(answers.budget)}
            onChange={(event) => patch('budget', Number(event.target.value) || 0)}
            hint="0 — без ограничения"
          />
        </div>

        <Choice
          label="Вкус"
          options={TASTES}
          value={answers.taste}
          onChange={(value) => patch('taste', value)}
        />

        <div>
          <p className="field-label">Ограничения и аллергии</p>
          <div className="flex flex-wrap gap-1.5">
            {RESTRICTIONS.map((item) => {
              const active = answers.restrictions.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleRestriction(item.id)}
                  className={CHIP(active)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="field-hint">Если ничего не выбрано — считаем, что ограничений нет.</p>
        </div>

        <Choice
          label="Стиль"
          options={STYLES}
          value={answers.style}
          onChange={(value) => patch('style', value)}
        />

        <Button fullWidth size="lg" onClick={() => void handleRecommend()} disabled={loading}>
          <Icon name="sparkle" className="size-4" />
          {loading ? 'Подбираем…' : 'Подобрать варианты'}
        </Button>

        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((option) => (
              <div
                key={option.id}
                className="rounded-2xl border border-line bg-cream-100/60 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-cocoa">{option.title}</p>
                  <p className="shrink-0 font-display text-lg font-semibold text-caramel-dark">
                    {formatPrice(option.price)}
                  </p>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-ink/65">{option.reason}</p>

                {!option.withinBudget && (
                  <p className="mt-1 text-[11px] font-semibold text-berry-dark">Выше бюджета</p>
                )}

                {option.warnings.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-ink/55">
                    {option.warnings.map((warning) => (
                      <li key={warning}>· {warning}</li>
                    ))}
                  </ul>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  className="mt-2"
                  onClick={() => {
                    onApply(option.config);
                    onClose();
                  }}
                >
                  Применить в конструкторе
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="rounded-2xl bg-cream-100 px-3 py-2.5 text-[11px] leading-relaxed text-ink/55">
          Демо-помощник на правилах: подбирает вес, вкус и декор по ответам. Подключение AI — по
          документу <code className="text-cocoa">docs/ai-cake-assistant.md</code>. Состав с
          аллергенами всегда подтверждайте у кондитера.
        </p>
      </div>
    </Modal>
  );
}
