import React, { useMemo, useState } from 'react';
import { MoreVertical, Edit2, Trash2, Search, Clock } from 'lucide-react';
import RoleBadge from './RoleBadge';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { isPending, memberName, type TeamMember, type TeamRole } from '../../types/team';
import { useConfirm } from '../../context/ConfirmContext';

interface TeamListProps {
  members: TeamMember[];
  onRemove: (member: TeamMember) => void;
  onEditRole: (member: TeamMember) => void;
  /** Role of the signed-in user — only OWNER and ADMIN may manage the team. */
  currentUserRole: TeamRole;
  /** Membership id of the signed-in user, so they can't act on themselves. */
  currentMemberId?: string;
}

const TeamList: React.FC<TeamListProps> = ({
  members,
  onRemove,
  onEditRole,
  currentUserRole,
  currentMemberId,
}) => {
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => memberName(m).toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleRemove = async (member: TeamMember) => {
    setActiveMenu(null);
    const ok = await confirm({
      title: `Remove ${memberName(member)}?`,
      message: 'They lose access to this workspace immediately.',
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (ok) onRemove(member);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search team members"
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 px-6">
          <p className="text-gray-900 font-semibold mb-1">
            {searchQuery ? 'No matches' : 'No team members yet'}
          </p>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? 'Try a different name or email.'
              : 'Invite a teammate to share this workspace.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-medium text-gray-500 px-4 py-3">Member</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                {canManage && <th className="w-12 px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const pending = isPending(member);
                const isSelf = member.id === currentMemberId;
                // Ownership can only change through a transfer, not from this menu.
                const actionable = canManage && !isSelf && member.role !== 'OWNER';

                return (
                  <tr key={member.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {memberName(member).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {memberName(member)}
                            {isSelf && <span className="text-gray-400 font-normal"> (you)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>

                    <td className="px-4 py-3">
                      {pending ? (
                        <Badge tone="warning" icon={Clock}>
                          Invite pending
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.joinedAt as string).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    {canManage && (
                      <td className="px-4 py-3 text-right relative">
                        {actionable && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenu(activeMenu === member.id ? null : member.id)
                              }
                              aria-label={`Actions for ${memberName(member)}`}
                              aria-expanded={activeMenu === member.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenu === member.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-4 top-11 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenu(null);
                                      onEditRole(member);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Change role
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(member)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default TeamList;
