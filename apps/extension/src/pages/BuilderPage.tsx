import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CakeAssistant } from '@/components/assistant/CakeAssistant';
import { CakePreview } from '@/components/cake/CakePreview';
import { OptionCard, OptionGroup } from '@/components/cake/OptionGroup';
import { PriceSummary } from '@/components/cake/PriceSummary';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCakeBuilder } from '@/hooks/useCakeBuilder';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { cakeData } from '@/references';
import { MAX_INSCRIPTION_LENGTH } from '@/utils/cake';
import { formatPrice } from '@/utils/formatPrice';

/** Конструктор: 6 шагов, живое превью и пересчёт цены в реальном времени. */
export function BuilderPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const { getItem, addItem, updateItem } = useCart();
  const { showToast } = useToast();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const editing = editId ? getItem(editId) : undefined;
  const {
    config,
    price,
    setSize,
    setBase,
    setFilling,
    setCream,
    toggleDecoration,
    setInscription,
    applyConfig,
  } = useCakeBuilder(editing?.config);

  const handleSubmit = () => {
    if (editing) {
      updateItem(editing.id, config);
      showToast('Изменения сохранены');
    } else {
      addItem(config);
      showToast('Торт добавлен в корзину');
    }
    navigate('/cart');
  };

  return (
    <div className="container-page pb-28 pt-8 lg:pb-12 lg:pt-12">
      <nav aria-label="Хлебные крошки" className="text-xs text-ink/50">
        <Link to="/" className="transition-colors hover:text-caramel-dark">
          Главная
        </Link>{' '}
        / <span className="text-ink/70">Конструктор</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
            Соберите свой идеальный торт
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
            Выберите основу, начинку, декор и добавьте надпись. Цена рассчитается автоматически.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing && <Badge tone="mint">Режим редактирования</Badge>}
          <Button variant="outline" size="sm" onClick={() => setAssistantOpen(true)}>
            <Icon name="sparkle" className="size-4" />
            Помогите выбрать
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="lg:hidden">
            <div className="rounded-3xl border border-line bg-cream-50 p-3 shadow-card">
              <CakePreview config={config} />
            </div>
          </div>

          <OptionGroup step={1} title="Вес торта" hint="От веса зависят количество порций и итоговая цена">
            <div className="grid gap-2 sm:grid-cols-3">
              {cakeData.sizes.map((size) => (
                <OptionCard
                  key={size.id}
                  selected={config.sizeId === size.id}
                  onSelect={() => setSize(size.id)}
                  label={size.label}
                  description={size.servings}
                  meta={formatPrice(size.basePrice)}
                  badge={size.badge}
                />
              ))}
            </div>
          </OptionGroup>

          <OptionGroup step={2} title="Основа" hint="Бисквит, медовик или муссовый">
            <div className="grid gap-2 sm:grid-cols-3">
              {cakeData.bases.map((item) => (
                <OptionCard
                  key={item.id}
                  selected={config.baseId === item.id}
                  onSelect={() => setBase(item.id)}
                  label={item.label}
                  description={item.description}
                  meta={item.extraPrice > 0 ? `+${formatPrice(item.extraPrice)}` : 'включено'}
                  color={item.palette.tier}
                />
              ))}
            </div>
          </OptionGroup>

          <OptionGroup step={3} title="Начинка" hint="Шоколадная, ягодная, карамельная или фруктовая">
            <div className="grid gap-2 sm:grid-cols-2">
              {cakeData.fillings.map((item) => (
                <OptionCard
                  key={item.id}
                  selected={config.fillingId === item.id}
                  onSelect={() => setFilling(item.id)}
                  label={item.label}
                  description={item.description}
                  meta={item.extraPrice > 0 ? `+${formatPrice(item.extraPrice)}` : 'включено'}
                  color={item.palette.filling}
                />
              ))}
            </div>
          </OptionGroup>

          <OptionGroup step={4} title="Крем" hint="Сливочный, творожный, шоколадный или сырный">
            <div className="grid gap-2 sm:grid-cols-2">
              {cakeData.creams.map((item) => (
                <OptionCard
                  key={item.id}
                  selected={config.creamId === item.id}
                  onSelect={() => setCream(item.id)}
                  label={item.label}
                  description={item.description}
                  meta={item.extraPrice > 0 ? `+${formatPrice(item.extraPrice)}` : 'включено'}
                  color={item.palette.cream}
                />
              ))}
            </div>
          </OptionGroup>

          <OptionGroup step={5} title="Декор" hint="Можно выбрать несколько вариантов">
            <div className="grid gap-2 sm:grid-cols-2">
              {cakeData.decorations.map((item) => (
                <OptionCard
                  key={item.id}
                  role="checkbox"
                  selected={config.decorationIds.includes(item.id)}
                  onSelect={() => toggleDecoration(item.id)}
                  label={item.label}
                  description={item.description}
                  meta={`+${formatPrice(item.price)}`}
                />
              ))}
            </div>
          </OptionGroup>

          <OptionGroup
            step={6}
            title="Надпись на торте"
            hint="Буквы, цифры и простая пунктуация — напишем кремом"
          >
            <Input
              value={config.inscription}
              onChange={(event) => setInscription(event.target.value)}
              placeholder="Например: С днём рождения, Аня!"
              maxLength={MAX_INSCRIPTION_LENGTH}
              autoComplete="off"
              hint={`${config.inscription.length}/${MAX_INSCRIPTION_LENGTH} · надпись +${formatPrice(
                cakeData.pricing.inscriptionPrice,
              )}`}
            />
          </OptionGroup>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-line bg-cream-50 p-3 shadow-card">
              <CakePreview config={config} />
            </div>

            <PriceSummary config={config} price={price}>
              <Button fullWidth size="lg" onClick={handleSubmit}>
                <Icon name="cart" className="size-5" />
                {editing ? 'Сохранить изменения' : 'Добавить в корзину'}
              </Button>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-ink/50">
                Цена окончательная: без доплат «за сложность»
              </p>
            </PriceSummary>
          </div>
        </aside>
      </div>

      {/* Мобильная закреплённая панель с ценой и CTA */}
      <div className="pb-safe fixed inset-x-0 bottom-[64px] z-40 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/50">Итого</p>
            <p className="truncate font-display text-xl font-semibold text-caramel-dark">
              {formatPrice(price.total)}
            </p>
          </div>
          <Button onClick={handleSubmit}>
            <Icon name="cart" className="size-4" />
            {editing ? 'Сохранить' : 'В корзину'}
          </Button>
        </div>
      </div>

      <CakeAssistant
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        onApply={(nextConfig) => {
          applyConfig(nextConfig);
          showToast('Состав перенесён в конструктор');
        }}
      />
    </div>
  );
}
