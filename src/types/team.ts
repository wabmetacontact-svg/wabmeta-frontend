// src/types/team.ts
//
// Mirrors the backend exactly. Source of truth:
//   wabmeta-backend/src/modules/organizations/organizations.types.ts
//     -> OrganizationMemberResponse
//   wabmeta-backend/prisma/schema.prisma -> enum UserRole
//
// Team members are organization members: there is no /api/team on the backend,
// they live under /api/organizations/:id/members.

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

/** Roles that can be assigned to someone else. Ownership transfers separately. */
export const ASSIGNABLE_ROLES: TeamRole[] = ['ADMIN', 'MEMBER', 'VIEWER'];

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  role: TeamRole;
  /** null until the invite is accepted. */
  joinedAt: string | null;
  invitedAt: string;
}

export interface RoleDefinition {
  value: TeamRole;
  label: string;
  description: string;
  color: string;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full access to every feature, setting and billing detail.',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can run campaigns, edit templates and manage contacts.',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Read-only access. Cannot send messages or change settings.',
    color: 'border-gray-200 bg-gray-50 text-gray-700',
  },
];

export const memberName = (m: TeamMember): string =>
  [m.firstName, m.lastName].filter(Boolean).join(' ').trim() || m.email;

/** An invite that has not been accepted yet. */
export const isPending = (m: TeamMember): boolean => !m.joinedAt;
