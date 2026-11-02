import type { RequestHandler } from 'express';
import type { UserRepository } from '../../users/types/userRepository.js';
import type { AccessTokenService } from '../services/accessTokenService.js';
import { HttpError } from '../../../shared/httpError.js';

export function authenticate(
  users: UserRepository,
  tokens: AccessTokenService,
): RequestHandler {
  return async (request, _response, next) => {
    const authorization = request.header('authorization');
    const match = authorization?.match(/^Bearer ([^\s]+)$/i);
    const token = match?.[1];
    if (!token) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Wymagane jest uwierzytelnienie.'));
      return;
    }

    const userId = await tokens.subject(token);
    if (!userId) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Token jest nieprawidłowy lub wygasł.'));
      return;
    }

    const user = await users.findIdentityById(userId);
    if (!user || !user.isActive) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Konto jest niedostępne.'));
      return;
    }

    request.auth = { userId: user.id, companyId: user.companyId, role: user.role };
    next();
  };
}
