import type { EntityId, ISODateTime } from '../common/identifiers.js';
import type { TaskStatus } from './taskStatus.js';

export interface Task {
  id: EntityId;
  companyId: EntityId;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdById: EntityId;
  assignedToId: EntityId | null;
  dueDate: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
