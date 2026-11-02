import type { UserRepository } from '../../users/types/userRepository.js';
import type { UserRole } from '@real-estate-crm/shared-types';
import { HttpError } from '../../../shared/httpError.js';
import type { PasswordHasher } from '../../../shared/passwordHasher.js';
import { ACCESS_TOKEN_LIFETIME_SECONDS, type AccessTokenService } from './accessTokenService.js';

export interface LoginInput {
  companyId: string;
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: typeof ACCESS_TOKEN_LIFETIME_SECONDS;
  user: {
    id: string;
    companyId: string;
    role: UserRole;
  };
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: AccessTokenService,
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.users.findCredentials(input.companyId, input.email);
    if (!user || !user.isActive) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Nieprawidłowy e-mail, hasło lub firma.');
    }

    const passwordMatches = await this.hasher.verify(user.passwordHash, input.password);
    if (!passwordMatches) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Nieprawidłowy e-mail, hasło lub firma.');
    }

    return {
      accessToken: await this.tokens.issue(user.id),
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
      user: { id: user.id, companyId: user.companyId, role: user.role },
    };
  }
}
