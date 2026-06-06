import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 ease-out select-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ' +
    (fullWidth ? 'w-full ' : '');

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary:
      'bg-primary-500 text-white shadow-sm ' +
      'hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
    secondary:
      'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 ' +
      'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 ' +
      'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    danger:
      'bg-red-500 text-white shadow-sm ' +
      'hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

export default Button;