import { describe, expect, it } from 'vitest';
import { canAccessTask, canAssignTask, canUpdateTaskStatus } from './accessRules.js';

const task = { companyId: 'company-1', createdByRole: 'ADMIN' as const, assignedToId: 'agent-1' };

describe('tenant-aware access rules', () => {
  it('denies access across companies even to an admin', () => {
    expect(canAccessTask({ id: 'admin-2', companyId: 'company-2', role: 'ADMIN' }, task)).toBe(false);
  });

  it('limits agents to assigned tasks and permits same-company managers to monitor admin-created tasks', () => {
    expect(canAccessTask({ id: 'agent-1', companyId: 'company-1', role: 'AGENT' }, task)).toBe(true);
    expect(canAccessTask({ id: 'agent-2', companyId: 'company-1', role: 'AGENT' }, task)).toBe(false);
    expect(canAccessTask({ id: 'manager-1', companyId: 'company-1', role: 'MANAGER' }, task)).toBe(true);
    expect(canAccessTask({ id: 'admin-1', companyId: 'company-1', role: 'ADMIN' }, task)).toBe(true);
  });

  it('allows managers to assign only active same-company agents', () => {
    const manager = { id: 'manager-1', companyId: 'company-1', role: 'MANAGER' as const };
    expect(canAssignTask(manager, { id: 'agent-1', companyId: 'company-1', role: 'AGENT', isActive: true }, 'company-1', false)).toBe(true);
    expect(canAssignTask(manager, { id: 'agent-2', companyId: 'company-2', role: 'AGENT', isActive: true }, 'company-1', false)).toBe(false);
    expect(canAssignTask(manager, { id: 'agent-1', companyId: 'company-1', role: 'AGENT', isActive: false }, 'company-1', false)).toBe(false);
  });

  it('limits status updates to same-company managers and assigned agents', () => {
    expect(canUpdateTaskStatus({ id: 'agent-1', companyId: 'company-1', role: 'AGENT' }, task)).toBe(true);
    expect(canUpdateTaskStatus({ id: 'agent-2', companyId: 'company-1', role: 'AGENT' }, task)).toBe(false);
    expect(canUpdateTaskStatus({ id: 'manager-1', companyId: 'company-1', role: 'MANAGER' }, task)).toBe(true);
    expect(canUpdateTaskStatus({ id: 'admin-1', companyId: 'company-1', role: 'ADMIN' }, task)).toBe(false);
  });
});
