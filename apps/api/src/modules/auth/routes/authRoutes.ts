import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/authService.js';
import { createLoginController } from '../controllers/authController.js';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        success: false,
        message: 'Zbyt wiele prób logowania. Spróbuj ponownie później.',
        code: 'LOGIN_RATE_LIMITED',
      });
    },
  });
  router.post('/login', loginRateLimit, createLoginController(authService));
  return router;
}
