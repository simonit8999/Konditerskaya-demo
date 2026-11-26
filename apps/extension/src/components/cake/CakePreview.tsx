import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import type { CakeConfig, DecorationPreviewType } from '@/types';
import { getBase, getCream, getDecorations, getFilling, getSize } from '@/utils/cake';
import { cn } from '@/utils/cn';

/**
 * Живое превью торта на SVG.
 * Меняет цвет ярусов/крема/начинки и рисует декор в зависимости от выбора,
 * поэтому клиент сразу видит результат — без фотографий и без сети.
 */

const SPRINKLES = Array.from({ length: 24 }, (_, index) => ({
  x: 76 + ((index * 8.3) % 166),
  y: 166 + ((index * 13.7) % 54),
  color: ['#DAA520', '#FFD1DC', '#E0F2F1', '#DC143C'][index % 4],
}));

const STAR = 'm0,-10 3,6.2 6.8,1-4.9,4.8 1.2,6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1Z';

function splitInscription(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (lines.length < 1 && `${current} ${word}`.length <= 18) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

interface CakePreviewProps {
  config: CakeConfig;
  className?: string;
}

export function CakePreview({ config, className }: CakePreviewProps) {
  const size = getSize(config.sizeId);
  const base = getBase(config.baseId);
  const filling = getFilling(config.fillingId);
  const cream = getCream(config.creamId);
  const decorations = getDecorations(config.decorationIds);
  const types = new Set<DecorationPreviewType>(decorations.map((item) => item.preview.type));
  const lines = useMemo(() => splitInscription(config.inscription), [config.inscription]);

  const label = [
    `Торт ${size.label}`,
    base.label,
    `начинка ${filling.label.toLowerCase()}`,
    `крем ${cream.label.toLowerCase()}`,
    decorations.length > 0
      ? `декор: ${decorations.map((item) => item.label.toLowerCase()).join(', ')}`
      : 'без декора',
    config.inscription.trim() ? `надпись «${config.inscription.trim()}»` : 'без надписи',
  ].join(', ');

  return (
    <svg
      viewBox="0 0 320 300"
      role="img"
      aria-label={label}
      className={cn('h-auto max-h-[320px] w-full', className)}
    >
      <defs>
        <linearGradient id="cake-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEAF0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF8E1" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="120" rx="132" ry="96" fill="url(#cake-glow)" />
      <ellipse cx="160" cy="268" rx="94" ry="13" fill="#5A3A3A" opacity="0.1" />

      {/* Подставка */}
      <ellipse cx="160" cy="258" rx="118" ry="19" fill="#FFFDF6" stroke="#EADCC3" />
      <ellipse cx="160" cy="252" rx="118" ry="19" fill="#FFF8E1" stroke="#EADCC3" />

      {/* Корпус торта */}
      <path
        d="M62 150V232a98 18 0 0 0 196 0V150Z"
        fill={base.palette.tier}
        stroke="#C68E17"
        strokeOpacity="0.25"
        className="transition-[fill] duration-300"
      />
      <rect x="78" y="160" width="16" height="62" rx="8" fill="#FFFFFF" opacity="0.28" />

      {/* Верхняя поверхность + слой начинки */}
      <ellipse
        cx="160"
        cy="150"
        rx="98"
        ry="18"
        fill={cream.palette.cream}
        stroke="#EADCC3"
        className="transition-[fill] duration-300"
      />
      <ellipse
        cx="160"
        cy="150"
        rx="72"
        ry="11"
        fill={filling.palette.filling}
        opacity="0.32"
        className="transition-[fill] duration-300"
      />

      {/* Кремовая волна по краю */}
      <rect x="62" y="150" width="196" height="10" fill={cream.palette.cream} />
      {[-84, -56, -28, 0, 28, 56, 84].map((dx) => (
        <circle key={dx} cx={160 + dx} cy={158} r={9} fill={cream.palette.cream} />
      ))}

      {/* Карамельный бортик */}
      <path
        d="M62 226a98 18 0 0 0 196 0"
        stroke="#C68E17"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      <AnimatePresence>
        {types.has('sprinkles') && (
          <motion.g
            key="sprinkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {SPRINKLES.map((dot) => (
              <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r="1.9" fill={dot.color} />
            ))}
          </motion.g>
        )}

        {types.has('berries') && (
          <motion.g
            key="berries"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx="108" cy="146" r="9" fill="#DC143C" />
            <circle cx="126" cy="139" r="6.5" fill="#B3123A" />
            <circle cx="196" cy="141" r="8" fill="#DC143C" />
            <circle cx="214" cy="148" r="5.5" fill="#7A2740" />
            <ellipse cx="150" cy="136" rx="7" ry="3.5" fill="#A9D6D2" />
          </motion.g>
        )}

        {types.has('figures') && (
          <motion.g
            key="figures"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <path d="M118 150v-24" stroke="#C68E17" strokeWidth="2" />
            <path d={STAR} transform="translate(118 112)" fill="#DAA520" />
            <path d="M206 148v-20" stroke="#C68E17" strokeWidth="2" />
            <path d={STAR} transform="translate(206 118) scale(0.8)" fill="#C68E17" />
          </motion.g>
        )}

        {types.has('fondant') && (
          <motion.g
            key="fondant"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <path d={STAR} transform="translate(236 186) scale(1.1)" fill="#FFD1DC" stroke="#E4A0B3" />
            <path
              d="M84 196c0-5 4-8 8-8s8 3 8 8c0 6-8 11-8 11s-8-5-8-11Z"
              fill="#FFD1DC"
              stroke="#E4A0B3"
            />
          </motion.g>
        )}

        {types.has('cream') && (
          <motion.g
            key="cream"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {[104, 160, 216].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy={214} r="12" fill={cream.palette.cream} stroke="#EADCC3" />
                <circle cx={cx} cy={214} r="6" fill="none" stroke="#C68E17" strokeOpacity="0.45" />
              </g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Надпись */}
      <AnimatePresence mode="wait">
        {lines.length > 0 && (
          <motion.g
            key={lines.join(' ')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {lines.map((line, index) => (
              <text
                key={`${line}-${index}`}
                x="160"
                y={196 + index * 17}
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontSize="15"
                fontStyle="italic"
                fill="#5A3A3A"
              >
                {line}
              </text>
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
