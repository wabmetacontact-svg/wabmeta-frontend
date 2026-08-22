import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  /** Accessible name for a clickable card. Required when `onClick` is set. */
  label?: string;
  style?: React.CSSProperties;
}

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * The app's standard raised surface.
 *
 * A clickable card renders as a real <button>: the previous version put onClick
 * on a plain <div>, which keyboard and screen-reader users could not activate.
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  label,
  style,
}) => {
  const classes = [
    'bg-white border border-gray-200 rounded-2xl shadow-card transition-all duration-200',
    PADDINGS[padding],
    hover || onClick ? 'hover:shadow-soft hover:-translate-y-0.5' : '',
    onClick ? 'cursor-pointer text-left w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} style={style} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <div style={style} className={classes}>
      {children}
    </div>
  );
};

export default Card;
