import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-[background,box-shadow,transform,color] duration-200 ease-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-55 active:scale-[.98]';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gold-gradient text-cocoa-dark shadow-gold hover:shadow-soft hover:brightness-[1.03]',
  secondary: 'bg-berry text-white shadow-card hover:bg-berry-dark',
  outline: 'border border-caramel/45 bg-cream-50/60 text-cocoa hover:border-caramel hover:bg-cream-200/70',
  ghost: 'text-cocoa hover:bg-cream-200/70',
  danger: 'bg-berry/10 text-berry-dark hover:bg-berry/15',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-7 text-base',
};

/** Классы кнопки — переиспользуются для react-router <Link>. */
export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles(variant, size, fullWidth), className)}
      {...rest}
    />
  );
}
