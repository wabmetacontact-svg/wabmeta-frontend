import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-200',
    'select-none',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:translate-y-0 disabled:hover:shadow-none',
    fullWidth ? 'w-full' : '',
  ].join(' ');

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary: [
      'bg-primary-500 text-white',
      'hover:bg-primary-600',
      'hover:-translate-y-0.5',
      'hover:shadow-md active:translate-y-0',
      'shadow-sm',
    ].join(' '),

    secondary: [
      'bg-gray-100 text-gray-700',
      'hover:bg-gray-200 hover:text-gray-900',
      'active:bg-gray-300',
    ].join(' '),

    outline: [
      'bg-white text-gray-700',
      'border border-gray-200',
      'hover:bg-gray-50 hover:border-gray-300',
      'active:bg-gray-100',
    ].join(' '),

    ghost: [
      'bg-transparent text-gray-600',
      'hover:bg-gray-100 hover:text-gray-900',
      'active:bg-gray-200',
    ].join(' '),

    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600',
      'hover:-translate-y-0.5',
      'hover:shadow-md active:translate-y-0',
      'shadow-sm',
    ].join(' '),
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Please wait…</span>
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