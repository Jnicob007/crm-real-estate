export const USER_ROLES = ['ADMIN', 'MANAGER', 'AGENT'] as const;

export type UserRole = (typeof USER_ROLES)[number];
