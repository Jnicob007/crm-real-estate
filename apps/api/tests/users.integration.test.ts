import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { UserRole } from '@real-estate-crm/shared-types';
import { HttpError } from '../src/shared/httpError.js';
import { createApp } from '../src/app/app.js';
import { AuthService } from '../src/modules/auth/services/authService.js';
import { createAccessTokenService } from '../src/modules/auth/services/accessTokenService.js';
import { passwordHasher } from '../src/shared/passwordHasher.js';
import { UserService } from '../src/modules/users/services/userService.js';
import type {
  CreateUserRecord,
  CreatedUser,
  UserCredentials,
  UserIdentity,
  UserRepository,
} from '../src/modules/users/types/userRepository.js';

const COMPANY_ID = '55555555-5555-4555-8555-555555555555';
const OTHER_COMPANY_ID = '66666666-6666-4666-8666-666666666666';
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const MANAGER_ID = '22222222-2222-4222-8222-222222222222';
const AGENT_ID = '33333333-3333-4333-8333-333333333333';
const ADMIN_PASSWORD = 'SecureAdminPass123!';
const JWT_SECRET = 'integration-test-secret-with-more-than-32-characters';

class MemoryUserRepository implements UserRepository {
  readonly companies = new Set([COMPANY_ID]);
  readonly users = new Map<string, UserCredentials>();
  failCreate = false;

  async findCredentials(companyId: string, email: string): Promise<UserCredentials | null> {
    return [...this.users.values()].find((user) => user.companyId === companyId && user.email === email) ?? null;
  }

  async findIdentityById(userId: string): Promise<UserIdentity | null> {
    const user = this.users.get(userId);
    return user ? { id: user.id, companyId: user.companyId, role: user.role, isActive: user.isActive } : null;
  }

  async companyExists(companyId: string): Promise<boolean> {
    return this.companies.has(companyId);
  }

  async create(data: CreateUserRecord): Promise<CreatedUser> {
    if (this.failCreate) throw new Error('database details must not leak');
    if ([...this.users.values()].some((user) => user.companyId === data.companyId && user.email === data.email)) {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'Adres e-mail jest już zajęty w tej firmie.');
    }
    const id = randomUUID();
    const created: UserCredentials = { ...data, id, isActive: true };
    this.users.set(id, created);
    return {
      id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      role: created.role,
      isActive: created.isActive,
    };
  }

  seed(
    id: string,
    companyId: string,
    role: UserRole,
    passwordHash: string,
    email: string,
  ): void {
    this.users.set(id, {
      id,
      companyId,
      role,
      isActive: true,
      firstName: role,
      lastName: 'Test',
      email,
      passwordHash,
    });
  }
}

let adminPasswordHash: string;
let server: Server | undefined;
let repository: MemoryUserRepository;
let baseUrl: string;

beforeAll(async () => {
  adminPasswordHash = await passwordHasher.hash(ADMIN_PASSWORD);
});

afterEach(async () => {
  const activeServer = server;
  if (activeServer?.listening) {
    await new Promise<void>((resolve, reject) => {
      activeServer.close((error) => (error ? reject(error) : resolve()));
    });
  }
  server = undefined;
});

async function startApi(): Promise<void> {
  repository = new MemoryUserRepository();
  repository.seed(ADMIN_ID, COMPANY_ID, 'ADMIN', adminPasswordHash, 'admin@example.com');
  repository.seed(MANAGER_ID, COMPANY_ID, 'MANAGER', adminPasswordHash, 'manager@example.com');
  repository.seed(AGENT_ID, COMPANY_ID, 'AGENT', adminPasswordHash, 'agent@example.com');

  const tokens = createAccessTokenService(JWT_SECRET);
  const authService = new AuthService(repository, passwordHasher, tokens);
  const userService = new UserService(repository, passwordHasher);
  const app = createApp({ users: repository, tokens, authService, userService });
  const activeServer = app.listen(0, '127.0.0.1');
  server = activeServer;
  await new Promise<void>((resolve, reject) => {
    activeServer.once('listening', resolve);
    activeServer.once('error', reject);
  });
  const rawAddress = activeServer.address();
  if (!rawAddress || typeof rawAddress === 'string') throw new Error('Test server did not bind a TCP port.');
  const address: AddressInfo = rawAddress;
  baseUrl = `http://127.0.0.1:${address.port}`;
}

async function login(email = 'admin@example.com', password = ADMIN_PASSWORD): Promise<string> {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ companyId: COMPANY_ID, email, password }),
  });
  const body = await response.json() as { data?: { accessToken?: string } };
  if (!body.data?.accessToken) throw new Error('Test setup could not obtain an access token.');
  return body.data.accessToken;
}

async function createUser(token: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

function registration(role: string, email = 'worker@example.com'): object {
  return {
    firstName: 'Jan',
    lastName: 'Kowalski',
    email,
    password: 'ExamplePassword123!',
    role,
  };
}

describe('POST /api/users', () => {
  it('requires authentication and returns 401 for a missing or invalid token', async () => {
    await startApi();
    const missing = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN', 'x-company-id': COMPANY_ID },
    });
    const invalid = await createUser('not-a-token', registration('AGENT'));
    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
  });

  it.each(['AGENT', 'MANAGER', 'ADMIN'] as const)('allows ADMIN to create a %s account', async (role) => {
    await startApi();
    const token = await login();
    const response = await createUser(token, registration(role, `${role.toLowerCase()}-new@example.com`));
    const result = await response.json() as { success: boolean; data: CreatedUser };
    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.data.role).toBe(role);
    expect(repository.users.get(result.data.id)?.companyId).toBe(COMPANY_ID);
    expect(repository.users.get(result.data.id)?.email).toBe(`${role.toLowerCase()}-new@example.com`);
  });

  it.each([
    ['MANAGER', 'manager@example.com'],
    ['AGENT', 'agent@example.com'],
  ] as const)('denies %s account creation with 403', async (_role, email) => {
    await startApi();
    const token = await login(email);
    const response = await createUser(token, registration('ADMIN'));
    expect(response.status).toBe(403);
    expect(repository.users.size).toBe(3);
  });

  it('rejects untrusted tenant, actor, permission and password-hash fields', async () => {
    await startApi();
    const token = await login();
    const response = await createUser(token, {
      ...registration('AGENT'),
      companyId: OTHER_COMPANY_ID,
      administratorId: ADMIN_ID,
      permissions: ['users:create'],
      passwordHash: adminPasswordHash,
    });
    expect(response.status).toBe(400);
    expect(repository.users.size).toBe(3);
  });

  it.each([
    [{ ...registration('AGENT'), email: 'not-an-email' }],
    [registration('OWNER')],
    [{ ...registration('AGENT'), password: 'short' }],
  ])('rejects invalid registration data', async (body) => {
    await startApi();
    const response = await createUser(await login(), body);
    expect(response.status).toBe(400);
  });

  it('rejects duplicate company email with 409 and canonicalizes case', async () => {
    await startApi();
    const token = await login();
    const first = await createUser(token, registration('AGENT', 'new@example.com'));
    const duplicate = await createUser(token, registration('MANAGER', 'NEW@example.com'));
    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
  });

  it('stores only an Argon2id hash and never returns a password or hash', async () => {
    await startApi();
    const token = await login();
    const response = await createUser(token, registration('AGENT'));
    const responseText = await response.text();
    const created = [...repository.users.values()].find((user) => user.email === 'worker@example.com');
    expect(created).toBeDefined();
    if (!created) throw new Error('Test setup did not persist the new user.');
    expect(created.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await passwordHasher.verify(created.passwordHash, 'ExamplePassword123!')).toBe(true);
    expect(responseText).not.toContain('ExamplePassword123!');
    expect(responseText).not.toContain(created.passwordHash);
    expect(responseText).not.toContain('passwordHash');
  });

  it('denies an ADMIN whose company is missing and hides unexpected database details', async () => {
    await startApi();
    repository.companies.delete(COMPANY_ID);
    const companyMissing = await createUser(await login(), registration('AGENT'));
    expect(companyMissing.status).toBe(403);

    repository.companies.add(COMPANY_ID);
    repository.failCreate = true;
    const databaseFailure = await createUser(await login(), registration('AGENT', 'another@example.com'));
    const responseText = await databaseFailure.text();
    expect(databaseFailure.status).toBe(500);
    expect(responseText).not.toContain('database details');
  });

  it('rejects invalid credentials with a generic 401 response', async () => {
    await startApi();
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_ID, email: 'admin@example.com', password: 'wrong-password' }),
    });
    expect(response.status).toBe(401);
    expect((await response.text()).toLowerCase()).not.toContain('hash');
  });
});
