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
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2 
    font-semibold rounded-xl 
    transition-all duration-300 ease-out
    overflow-hidden group
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:translate-y-0
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-green-500 to-emerald-500
      text-white border border-green-400/40
      shadow-[0_8px_24px_rgba(16,185,129,0.35)]
      hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)]
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-white/[0.06] backdrop-blur-xl
      text-white border border-white/[0.12]
      hover:bg-white/[0.1] hover:border-white/[0.2]
    `,
    ghost: `
      text-gray-300 hover:text-white
      hover:bg-white/[0.05]
      border border-transparent
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-500
      text-white border border-red-400/40
      shadow-[0_8px_24px_rgba(239,68,68,0.35)]
      hover:shadow-[0_12px_32px_rgba(239,68,68,0.5)]
      hover:-translate-y-0.5
    `,
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {/* Shine effect for primary */}
      {variant === 'primary' && !isDisabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent
          -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      <span className="relative z-10 inline-flex items-center gap-2">
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
      </span>
    </button>
  );
};

export default Button;