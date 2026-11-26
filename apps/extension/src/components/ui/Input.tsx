import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-12 w-full rounded-2xl border bg-cream-50 px-4 text-[15px] text-ink shadow-innerLine transition-colors',
          'placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
          error ? 'border-berry/60' : 'border-line',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
