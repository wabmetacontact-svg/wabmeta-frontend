// src/pages/Team.tsx
//
// Team members are organization members on the backend — there is no /api/team.
// Everything here goes through /api/organizations/:id/members.

import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { organizations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import PageLoader from '../components/common/PageLoader';
import TeamStats from '../components/team/TeamStats';
import TeamList from '../components/team/TeamList';
import InviteMemberModal from '../components/team/InviteMemberModal';
import {
  ASSIGNABLE_ROLES,
  memberName,
  type TeamMember,
  type TeamRole,
} from '../types/team';

const Team: React.FC = () => {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      // The members list comes back on the organization itself.
      const res = await organizations.getCurrent();
      const org = res.data?.data;
      if (!org) throw new Error('No organization found for this account.');
      setOrgId(org.id);
      setMembers(Array.isArray(org.members) ? org.members : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not load your team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currentMember = members.find((m) => m.userId === user?.id);
  const currentUserRole: TeamRole = currentMember?.role ?? 'VIEWER';
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const handleInvite = async (email: string, role: TeamRole) => {
    if (!orgId) return;
    await organizations.inviteMember(orgId, { email, role });
    toast.success(`Invite sent to ${email}`);
    await load();
  };

  const handleRemove = async (member: TeamMember) => {
    if (!orgId) return;
    // Optimistic: put the row back if the request fails.
    const previous = members;
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    try {
      await organizations.removeMember(orgId, member.id);
      toast.success(`${memberName(member)} removed`);
    } catch (err: any) {
      setMembers(previous);
      toast.error(err?.response?.data?.message || 'Could not remove that member.');
    }
  };

  const handleEditRole = async (member: TeamMember) => {
    if (!orgId) return;
    const next = ASSIGNABLE_ROLES[
      (ASSIGNABLE_ROLES.indexOf(member.role) + 1) % ASSIGNABLE_ROLES.length
    ];

    const ok = await confirm({
      title: `Change role to ${next.charAt(0) + next.slice(1).toLowerCase()}?`,
      message: `${memberName(member)} is currently ${member.role.toLowerCase()}.`,
      confirmLabel: 'Change role',
    });
    if (!ok) return;

    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: next } : m)));
    try {
      await organizations.updateMemberRole(orgId, member.id, next);
      toast.success('Role updated');
    } catch (err: any) {
      setMembers(previous);
      toast.error(err?.response?.data?.message || 'Could not update that role.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            Everyone with access to this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            aria-label="Refresh team list"
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite member
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-2 text-sm font-semibold text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          <TeamStats members={members} />

          <TeamList
            members={members}
            onRemove={handleRemove}
            onEditRole={handleEditRole}
            currentUserRole={currentUserRole}
            currentMemberId={currentMember?.id}
          />

          {!canManage && (
            <p className="text-xs text-gray-500">
              Only owners and admins can invite or remove members.
            </p>
          )}
        </>
      )}

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default Team;
