import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', helperText, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-150
                ${error ? 'text-red-500' : 'text-gray-400'}`}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
              w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-400
              border outline-none transition-colors duration-150
              ${icon ? 'pl-11' : 'pl-3.5'}
              ${isPassword ? 'pr-11' : 'pr-3.5'}
              h-11 text-sm
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-gray-200 hover:border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/15'
              }
              ${className}
            `}
            aria-invalid={!!error}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-lg p-1
                text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-500">
            <span className="h-1 w-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;