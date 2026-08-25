import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        variant === 'danger' && 'bg-danger text-white hover:bg-red-700',
        variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100',
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}