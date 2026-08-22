import React from 'react';

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  /** Small leading icon, e.g. a lucide component. */
  icon?: React.ElementType;
  /** Softer, borderless variant for dense rows. */
  subtle?: boolean;
  className?: string;
}

/**
 * Status pill.
 *
 * The colour pairs below are the ones already in use across Campaigns,
 * Templates, Leads and the admin tables — this consolidates roughly 25 hand-rolled
 * copies of the same markup rather than introducing a new look.
 */
const TONES: Record<BadgeTone, { solid: string; subtle: string }> = {
  neutral: {
    solid: 'bg-gray-100 text-gray-700 border-gray-200',
    subtle: 'bg-gray-50 text-gray-600 border-transparent',
  },
  success: {
    solid: 'bg-green-100 text-green-700 border-green-200',
    subtle: 'bg-green-50 text-green-700 border-transparent',
  },
  info: {
    solid: 'bg-blue-100 text-blue-700 border-blue-200',
    subtle: 'bg-blue-50 text-blue-700 border-transparent',
  },
  warning: {
    solid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    subtle: 'bg-yellow-50 text-yellow-700 border-transparent',
  },
  danger: {
    solid: 'bg-red-100 text-red-700 border-red-200',
    subtle: 'bg-red-50 text-red-700 border-transparent',
  },
  accent: {
    solid: 'bg-purple-100 text-purple-700 border-purple-200',
    subtle: 'bg-purple-50 text-purple-700 border-transparent',
  },
};

const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'neutral',
  icon: Icon,
  subtle = false,
  className = '',
}) => {
  const palette = TONES[tone] ?? TONES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${
        subtle ? palette.subtle : palette.solid
      } ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
