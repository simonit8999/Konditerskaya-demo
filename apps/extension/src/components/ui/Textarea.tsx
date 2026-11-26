import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, rows = 4, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="field-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-2xl border bg-cream-50 px-4 py-3 text-[15px] leading-relaxed text-ink shadow-innerLine transition-colors',
          'placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
          error ? 'border-berry/60' : 'border-line',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
