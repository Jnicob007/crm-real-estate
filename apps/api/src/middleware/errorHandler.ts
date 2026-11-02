import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../shared/httpError.js';
import type { ErrorResponse } from '../shared/apiResponse.js';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Nie znaleziono zasobu.',
    code: 'NOT_FOUND',
  } satisfies ErrorResponse);
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code,
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: 'Nieprawidłowe dane wejściowe.',
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    } satisfies ErrorResponse);
    return;
  }

  if (isMalformedJson(error)) {
    response.status(400).json({
      success: false,
      message: 'Nieprawidłowy format JSON.',
      code: 'INVALID_JSON',
    } satisfies ErrorResponse);
    return;
  }

  console.error('Unhandled API error');
  response.status(500).json({
    success: false,
    message: 'Wystąpił nieoczekiwany błąd serwera.',
    code: 'INTERNAL_SERVER_ERROR',
  } satisfies ErrorResponse);
};

function isMalformedJson(error: unknown): error is SyntaxError & { status: number } {
  return error instanceof SyntaxError && 'status' in error && error.status === 400;
}
