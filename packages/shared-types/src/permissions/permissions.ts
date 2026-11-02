import type { UserRole } from '../user/roles.js';

export const PERMISSIONS = {
  USERS_CREATE: 'users:create',
  USERS_VIEW: 'users:view',
  USERS_UPDATE: 'users:update',
  USERS_DEACTIVATE: 'users:deactivate',
  TASKS_CREATE: 'tasks:create',
  TASKS_VIEW_ALL: 'tasks:view_all',
  TASKS_VIEW_ADMIN_CREATED: 'tasks:view_admin_created',
  TASKS_VIEW_ASSIGNED: 'tasks:view_assigned',
  TASKS_ASSIGN: 'tasks:assign',
  TASKS_REASSIGN: 'tasks:reassign',
  TASKS_MONITOR: 'tasks:monitor',
  TASKS_STATUS_UPDATE: 'tasks:status_update',
  ORGANIZATION_MANAGE: 'organization:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS = {
  ADMIN: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DEACTIVATE,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.ORGANIZATION_MANAGE,
  ],
  MANAGER: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.TASKS_VIEW_ADMIN_CREATED,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.TASKS_REASSIGN,
    PERMISSIONS.TASKS_MONITOR,
    PERMISSIONS.TASKS_STATUS_UPDATE,
  ],
  AGENT: [PERMISSIONS.TASKS_VIEW_ASSIGNED, PERMISSIONS.TASKS_STATUS_UPDATE],
} as const satisfies Record<UserRole, readonly Permission[]>;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].some((grantedPermission) => grantedPermission === permission);
}
