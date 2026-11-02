import { Prisma, type PrismaClient } from '../../../generated/prisma/client.js';
import { HttpError } from '../../../shared/httpError.js';
import type {
  CreateUserRecord,
  CreatedUser,
  UserCredentials,
  UserIdentity,
  UserRepository,
} from '../types/userRepository.js';

const credentialsSelect = {
  id: true,
  companyId: true,
  role: true,
  isActive: true,
  firstName: true,
  lastName: true,
  email: true,
  passwordHash: true,
} satisfies Prisma.UserSelect;

const identitySelect = {
  id: true,
  companyId: true,
  role: true,
  isActive: true,
} satisfies Prisma.UserSelect;

const createdUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
} satisfies Prisma.UserSelect;

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findCredentials(companyId: string, email: string): Promise<UserCredentials | null> {
    return this.prisma.user.findUnique({
      where: { companyId_email: { companyId, email } },
      select: credentialsSelect,
    });
  }

  findIdentityById(userId: string): Promise<UserIdentity | null> {
    return this.prisma.user.findUnique({ where: { id: userId }, select: identitySelect });
  }

  async companyExists(companyId: string): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    return company !== null;
  }

  async create(data: CreateUserRecord): Promise<CreatedUser> {
    try {
      return await this.prisma.user.create({ data, select: createdUserSelect });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'Adres e-mail jest już zajęty w tej firmie.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new HttpError(409, 'COMPANY_UNAVAILABLE', 'Nie można przypisać użytkownika do tej firmy.');
      }
      throw error;
    }
  }
}
