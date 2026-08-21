import React from 'react';
import { Shield, ShieldAlert, User, Eye } from 'lucide-react';
import type { TeamRole } from '../../types/team';

interface RoleBadgeProps {
  role: TeamRole;
}

const CONFIG: Record<TeamRole, { icon: React.ElementType; text: string; className: string }> = {
  OWNER: {
    icon: ShieldAlert,
    text: 'Owner',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  ADMIN: {
    icon: Shield,
    text: 'Admin',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  MEMBER: {
    icon: User,
    text: 'Member',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  VIEWER: {
    icon: Eye,
    text: 'Viewer',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const current = CONFIG[role] ?? CONFIG.VIEWER;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {current.text}
    </span>
  );
};

export default RoleBadge;
