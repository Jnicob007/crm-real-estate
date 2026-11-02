import type { RequestHandler } from 'express';
import { hasPermission, type Permission } from '@real-estate-crm/shared-types';
import { HttpError } from '../shared/httpError.js';

export function requirePermission(permission: Permission): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Wymagane jest uwierzytelnienie.'));
      return;
    }
    if (!hasPermission(request.auth.role, permission)) {
      next(new HttpError(403, 'FORBIDDEN', 'Brak uprawnień do wykonania tej operacji.'));
      return;
    }
    next();
  };
}
