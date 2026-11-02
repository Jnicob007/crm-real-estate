import type { RequestHandler } from 'express';
import { HttpError } from '../../../shared/httpError.js';
import type { SuccessResponse } from '../../../shared/apiResponse.js';
import { UserService } from '../services/userService.js';
import { parseCreateUserInput } from '../validators/createUserValidator.js';

export function createUserController(userService: UserService): RequestHandler {
  return async (request, response) => {
    if (!request.auth) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'Wymagane jest uwierzytelnienie.');
    }

    const body: unknown = request.body;
    const input = parseCreateUserInput(body);
    const user = await userService.create(request.auth, input);
    const result = {
      success: true,
      message: 'Użytkownik został utworzony.',
      data: user,
    } satisfies SuccessResponse<typeof user>;

    response.status(201).json(result);
  };
}
