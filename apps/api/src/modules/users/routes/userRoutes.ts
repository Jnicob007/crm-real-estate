import { Router } from 'express';
import { PERMISSIONS } from '@real-estate-crm/shared-types';
import type { UserRepository } from '../types/userRepository.js';
import { UserService } from '../services/userService.js';
import type { AccessTokenService } from '../../auth/services/accessTokenService.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { requirePermission } from '../../../middleware/requirePermission.js';
import { createUserController } from '../controllers/userController.js';

export function createUserRouter(
  users: UserRepository,
  tokens: AccessTokenService,
  userService: UserService,
): Router {
  const router = Router();
  router.post('/', authenticate(users, tokens), requirePermission(PERMISSIONS.USERS_CREATE), createUserController(userService));
  return router;
}
