// src/components/auth/OTPInput.tsx
import React, { useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete && !disabled) {
      onComplete(value);
    }
  }, [value, length, onComplete, disabled]);

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    const valueArray = value.split('');
    valueArray[index] = digit;

    const newValue = valueArray.join('').slice(0, length);
    onChange(newValue);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const valueArray = value.split('');

      if (valueArray[index]) {
        valueArray[index] = '';
        onChange(valueArray.join(''));
      } else if (index > 0) {
        valueArray[index - 1] = '';
        onChange(valueArray.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    const newValue = pasted.slice(0, length);
    onChange(newValue);

    const focusIndex = Math.min(newValue.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div
      className="flex justify-center space-x-2 sm:space-x-3"
      role="group"
      aria-label="One-Time Verification Code"
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-invalid={error}
          aria-required="true"
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`w-11 h-14 sm:w-12 sm:h-16
                      text-center text-xl sm:text-2xl font-bold
                      border-2 rounded-xl bg-white
                      transition-all duration-150
                      focus:outline-none focus:ring-2
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${error
              ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-500/20'
              : value[index]
                ? 'border-emerald-500 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
        />
      ))}
    </div>
  );
};

export default OTPInput;