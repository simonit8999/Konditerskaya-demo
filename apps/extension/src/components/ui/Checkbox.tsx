import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
        <input
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className={cn(
            'mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-line accent-gold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
            className,
          )}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
