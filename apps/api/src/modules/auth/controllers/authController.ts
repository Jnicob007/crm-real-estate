import type { RequestHandler } from 'express';
import { loginSchema } from '@real-estate-crm/validation';
import type { SuccessResponse } from '../../../shared/apiResponse.js';
import { AuthService } from '../services/authService.js';

export function createLoginController(authService: AuthService): RequestHandler {
  return async (request, response) => {
    const body: unknown = request.body;
    const input = loginSchema.parse(body);
    const data = await authService.login(input);
    const result = {
      success: true,
      message: 'Uwierzytelniono użytkownika.',
      data,
    } satisfies SuccessResponse<typeof data>;
    response.status(200).json(result);
  };
}
