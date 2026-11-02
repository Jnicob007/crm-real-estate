import type { EntityId } from '../common/identifiers.js';
import { hasPermission, PERMISSIONS } from './permissions.js';
import type { UserRole } from '../user/roles.js';

export interface Actor {
  id: EntityId;
  companyId: EntityId;
  role: UserRole;
}

export interface TaskAccessResource {
  companyId: EntityId;
  createdByRole: UserRole;
  assignedToId: EntityId | null;
}

export interface AssignmentTarget {
  id: EntityId;
  companyId: EntityId;
  role: UserRole;
  isActive: boolean;
}

/** Resource access is always scoped to the actor's tenant before role permissions are considered. */
export function canAccessTask(actor: Actor, task: TaskAccessResource): boolean {
  if (actor.companyId !== task.companyId) return false;

  if (hasPermission(actor.role, PERMISSIONS.TASKS_VIEW_ALL)) return true;

  if (
    hasPermission(actor.role, PERMISSIONS.TASKS_VIEW_ADMIN_CREATED) &&
    task.createdByRole === 'ADMIN'
  ) {
    return true;
  }

  return (
    hasPermission(actor.role, PERMISSIONS.TASKS_VIEW_ASSIGNED) &&
    task.assignedToId === actor.id
  );
}

export function canAssignTask(
  actor: Actor,
  target: AssignmentTarget,
  taskCompanyId: EntityId,
  isReassignment: boolean,
): boolean {
  if (
    actor.companyId !== taskCompanyId ||
    target.companyId !== taskCompanyId ||
    target.role !== 'AGENT' ||
    !target.isActive
  ) {
    return false;
  }

  const permission = isReassignment ? PERMISSIONS.TASKS_REASSIGN : PERMISSIONS.TASKS_ASSIGN;
  return hasPermission(actor.role, permission);
}

export function canUpdateTaskStatus(actor: Actor, task: TaskAccessResource): boolean {
  if (actor.companyId !== task.companyId) return false;
  if (!hasPermission(actor.role, PERMISSIONS.TASKS_STATUS_UPDATE)) return false;
  return actor.role === 'MANAGER' || task.assignedToId === actor.id;
}
