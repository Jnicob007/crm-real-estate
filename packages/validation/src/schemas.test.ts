import { describe, expect, it } from 'vitest';
import { companySchema, taskSchema, taskStatusSchema, userRoleSchema, userSchema } from './index.js';

describe('shared Zod contracts', () => {
  it('accepts the declared roles and statuses and rejects unknown values', () => {
    expect(userRoleSchema.safeParse('MANAGER').success).toBe(true);
    expect(userRoleSchema.safeParse('OWNER').success).toBe(false);
    expect(taskStatusSchema.safeParse('POSTPONED').success).toBe(true);
    expect(taskStatusSchema.safeParse('BLOCKED').success).toBe(false);
  });

  it('validates a public user without exposing a password hash', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      companyId: '550e8400-e29b-41d4-a716-446655440001',
      firstName: 'Ada',
      lastName: 'Nowak',
      email: 'ada@example.com',
      role: 'AGENT',
      isActive: true,
      createdAt: '2026-11-02T12:00:00.000Z',
      updatedAt: '2026-11-02T12:00:00.000Z',
    };
    expect(userSchema.safeParse(user).success).toBe(true);
    expect(userSchema.parse({ ...user, email: 'Ada@Example.com' }).email).toBe('ada@example.com');
  });

  it('validates company and unassigned task contracts', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const timestamp = '2026-11-02T12:00:00.000Z';
    expect(companySchema.safeParse({ id, name: 'Agencja', createdAt: timestamp, updatedAt: timestamp }).success).toBe(true);
    expect(taskSchema.safeParse({
      id,
      companyId: id,
      title: 'Przygotować ofertę',
      description: null,
      status: 'TODO',
      createdById: id,
      assignedToId: null,
      dueDate: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }).success).toBe(true);
  });
});
