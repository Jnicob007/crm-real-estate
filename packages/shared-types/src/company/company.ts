import type { EntityId, ISODateTime } from '../common/identifiers.js';

export interface Company {
  id: EntityId;
  name: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
