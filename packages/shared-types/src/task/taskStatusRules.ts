import type { Actor, TaskAccessResource } from '../permissions/accessRules.js';
import { canUpdateTaskStatus } from '../permissions/accessRules.js';
import type { TaskStatus } from './taskStatus.js';

export const TASK_STATUS_TRANSITIONS = {
  TODO: ['IN_PROGRESS', 'POSTPONED'],
  IN_PROGRESS: ['TODO', 'POSTPONED', 'COMPLETED'],
  POSTPONED: ['TODO', 'IN_PROGRESS'],
  COMPLETED: [],
} as const satisfies Record<TaskStatus, readonly TaskStatus[]>;

export function canTransitionTaskStatus(
  actor: Actor,
  task: TaskAccessResource,
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
): boolean {
  if (!canUpdateTaskStatus(actor, task) || currentStatus === nextStatus) return false;
  if (actor.role === 'MANAGER' && currentStatus === 'COMPLETED' && nextStatus === 'TODO') return true;
  return TASK_STATUS_TRANSITIONS[currentStatus].some((status) => status === nextStatus);
}
