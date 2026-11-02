import { env } from './config/env.js';
import { createPrismaClient } from './database/prismaClient.js';
import { PrismaUserRepository } from './modules/users/repositories/prismaUserRepository.js';
import { passwordHasher } from './shared/passwordHasher.js';
import { createAccessTokenService } from './modules/auth/services/accessTokenService.js';
import { AuthService } from './modules/auth/services/authService.js';
import { UserService } from './modules/users/services/userService.js';
import { createApp } from './app/app.js';

const prisma = createPrismaClient(env.DATABASE_URL);
const users = new PrismaUserRepository(prisma);
const tokens = createAccessTokenService(env.JWT_ACCESS_SECRET);
const app = createApp({
  users,
  tokens,
  authService: new AuthService(users, passwordHasher, tokens),
  userService: new UserService(users, passwordHasher),
});

const server = app.listen(env.API_PORT, () => {
  console.info(`API server listening on port ${env.API_PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
