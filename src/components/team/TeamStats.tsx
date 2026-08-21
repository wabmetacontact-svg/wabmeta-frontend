import React from 'react';
import { Users, UserCheck, Shield, Clock } from 'lucide-react';
import { isPending, type TeamMember } from '../../types/team';

interface TeamStatsProps {
  members: TeamMember[];
}

const TeamStats: React.FC<TeamStatsProps> = ({ members }) => {
  const total = members.length;
  const pending = members.filter(isPending).length;
  const active = total - pending;
  const admins = members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN').length;

  const stats = [
    { label: 'Total members', value: total, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active', value: active, icon: UserCheck, color: 'bg-green-100 text-green-600' },
    { label: 'Pending invites', value: pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Admins', value: admins, icon: Shield, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default TeamStats;
