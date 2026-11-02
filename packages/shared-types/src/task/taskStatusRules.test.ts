import { describe, expect, it } from 'vitest';
import { canTransitionTaskStatus } from './taskStatusRules.js';

const task = { companyId: 'company-1', createdByRole: 'ADMIN' as const, assignedToId: 'agent-1' };

describe('task status transitions', () => {
  it('allows an assigned agent to make a permitted transition', () => {
    expect(canTransitionTaskStatus(
      { id: 'agent-1', companyId: 'company-1', role: 'AGENT' }, task, 'TODO', 'IN_PROGRESS',
    )).toBe(true);
  });

  it('rejects forbidden, repeated, unassigned, and cross-tenant transitions', () => {
    expect(canTransitionTaskStatus({ id: 'agent-1', companyId: 'company-1', role: 'AGENT' }, task, 'TODO', 'COMPLETED')).toBe(false);
    expect(canTransitionTaskStatus({ id: 'agent-1', companyId: 'company-1', role: 'AGENT' }, task, 'TODO', 'TODO')).toBe(false);
    expect(canTransitionTaskStatus({ id: 'agent-2', companyId: 'company-1', role: 'AGENT' }, task, 'TODO', 'IN_PROGRESS')).toBe(false);
    expect(canTransitionTaskStatus({ id: 'manager-1', companyId: 'company-2', role: 'MANAGER' }, task, 'TODO', 'IN_PROGRESS')).toBe(false);
  });

  it('allows a same-company manager to monitor transitions, including reopening completed work', () => {
    expect(canTransitionTaskStatus({ id: 'manager-1', companyId: 'company-1', role: 'MANAGER' }, task, 'COMPLETED', 'TODO')).toBe(true);
  });
});
