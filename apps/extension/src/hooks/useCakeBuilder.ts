import { useCallback, useMemo, useState } from 'react';
import { cakeData, createDefaultConfig } from '@/references';
import type { CakeConfig } from '@/types';
import { describeCake, sanitizeInscription } from '@/utils/cake';
import { calculatePrice } from '@/utils/priceCalculator';

/**
 * Состояние конструктора: выбранный состав, цена и описание.
 * Цена пересчитывается мгновенно при любом изменении (memo).
 */
export function useCakeBuilder(initialConfig?: CakeConfig) {
  const [config, setConfig] = useState<CakeConfig>(() => initialConfig ?? createDefaultConfig());

  const price = useMemo(() => calculatePrice(config, cakeData), [config]);
  const description = useMemo(() => describeCake(config, cakeData), [config]);

  const setSize = useCallback((sizeId: string) => {
    setConfig((prev) => ({ ...prev, sizeId }));
  }, []);

  const setBase = useCallback((baseId: string) => {
    setConfig((prev) => ({ ...prev, baseId }));
  }, []);

  const setFilling = useCallback((fillingId: string) => {
    setConfig((prev) => ({ ...prev, fillingId }));
  }, []);

  const setCream = useCallback((creamId: string) => {
    setConfig((prev) => ({ ...prev, creamId }));
  }, []);

  const toggleDecoration = useCallback((decorationId: string) => {
    setConfig((prev) => ({
      ...prev,
      decorationIds: prev.decorationIds.includes(decorationId)
        ? prev.decorationIds.filter((id) => id !== decorationId)
        : [...prev.decorationIds, decorationId],
    }));
  }, []);

  const setInscription = useCallback((value: string) => {
    setConfig((prev) => ({ ...prev, inscription: sanitizeInscription(value) }));
  }, []);

  const reset = useCallback(() => {
    setConfig(createDefaultConfig());
  }, []);

  return {
    config,
    price,
    description,
    setSize,
    setBase,
    setFilling,
    setCream,
    toggleDecoration,
    setInscription,
    reset,
  };
}
