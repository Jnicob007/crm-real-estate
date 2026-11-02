import { describe, expect, it } from 'vitest';
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from './permissions.js';

describe('role permissions', () => {
  it('maps each role to its declared permission set', () => {
    expect(ROLE_PERMISSIONS.ADMIN).toContain(PERMISSIONS.TASKS_VIEW_ALL);
    expect(ROLE_PERMISSIONS.ADMIN).toContain(PERMISSIONS.ORGANIZATION_MANAGE);
    expect(ROLE_PERMISSIONS.MANAGER).toContain(PERMISSIONS.TASKS_ASSIGN);
    expect(ROLE_PERMISSIONS.MANAGER).toContain(PERMISSIONS.TASKS_VIEW_ADMIN_CREATED);
    expect(ROLE_PERMISSIONS.AGENT).toEqual([
      PERMISSIONS.TASKS_VIEW_ASSIGNED,
      PERMISSIONS.TASKS_STATUS_UPDATE,
    ]);
  });

  it('does not grant administrative permissions to agents', () => {
    expect(hasPermission('AGENT', PERMISSIONS.USERS_DEACTIVATE)).toBe(false);
    expect(hasPermission('AGENT', PERMISSIONS.TASKS_VIEW_ALL)).toBe(false);
  });
});
