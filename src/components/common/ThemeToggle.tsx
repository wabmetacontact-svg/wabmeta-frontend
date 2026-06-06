import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`
        relative w-10 h-10 rounded-full
        bg-white dark:bg-[#1A2331]
        border border-cream-300 dark:border-[#2A3441]
        text-ink-900 dark:text-cream-100
        hover:bg-cream-100 dark:hover:bg-[#131922]
        hover:shadow-soft
        transition-all duration-300
        flex items-center justify-center
        ${className}
      `}
    >
      <Sun className={`absolute w-4 h-4 transition-all duration-500
        ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
      <Moon className={`absolute w-4 h-4 transition-all duration-500
        ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
    </button>
  );
};

export default ThemeToggle;
