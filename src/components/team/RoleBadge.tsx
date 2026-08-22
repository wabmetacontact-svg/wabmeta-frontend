import React from 'react';
import { Shield, ShieldAlert, User, Eye } from 'lucide-react';
import Badge, { type BadgeTone } from '../common/Badge';
import type { TeamRole } from '../../types/team';

interface RoleBadgeProps {
  role: TeamRole;
}

const CONFIG: Record<TeamRole, { icon: React.ElementType; text: string; tone: BadgeTone }> = {
  OWNER:  { icon: ShieldAlert, text: 'Owner',  tone: 'accent' },
  ADMIN:  { icon: Shield,      text: 'Admin',  tone: 'info' },
  MEMBER: { icon: User,        text: 'Member', tone: 'success' },
  VIEWER: { icon: Eye,         text: 'Viewer', tone: 'neutral' },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const current = CONFIG[role] ?? CONFIG.VIEWER;
  return (
    <Badge tone={current.tone} icon={current.icon}>
      {current.text}
    </Badge>
  );
};

export default RoleBadge;
