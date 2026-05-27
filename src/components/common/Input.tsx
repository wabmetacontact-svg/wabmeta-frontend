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
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          {/* Glow effect on focus */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
            ${isFocused 
              ? 'opacity-100 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-md' 
              : 'opacity-0'
            }`}
          />

          {icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300
              ${error 
                ? 'text-red-400' 
                : isFocused 
                  ? 'text-green-400' 
                  : 'text-gray-500'
              }`}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              relative w-full
              ${icon ? 'pl-12' : 'pl-4'} 
              ${isPassword ? 'pr-12' : 'pr-4'} 
              py-3.5 
              bg-white/[0.04] backdrop-blur-xl
              border rounded-xl 
              text-white placeholder:text-gray-500
              transition-all duration-300
              focus:outline-none focus:bg-white/[0.06]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-400/40 focus:border-red-400/60'
                : 'border-white/[0.08] focus:border-green-400/40 hover:border-white/[0.15]'
              }
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                text-gray-500 hover:text-white transition-colors
                p-1 rounded-lg hover:bg-white/[0.05]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 animate-fadeIn">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;