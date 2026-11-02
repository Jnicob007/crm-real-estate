export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'POSTPONED', 'COMPLETED'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
