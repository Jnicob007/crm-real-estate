import express from 'express';
import type { AuthService } from '../modules/auth/services/authService.js';
import type { AccessTokenService } from '../modules/auth/services/accessTokenService.js';
import type { UserRepository } from '../modules/users/types/userRepository.js';
import type { UserService } from '../modules/users/services/userService.js';
import { createAuthRouter } from '../modules/auth/routes/authRoutes.js';
import { createUserRouter } from '../modules/users/routes/userRoutes.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

export interface AppDependencies {
  users: UserRepository;
  tokens: AccessTokenService;
  authService: AuthService;
  userService: UserService;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/auth', createAuthRouter(dependencies.authService));
  app.use('/api/users', createUserRouter(dependencies.users, dependencies.tokens, dependencies.userService));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
