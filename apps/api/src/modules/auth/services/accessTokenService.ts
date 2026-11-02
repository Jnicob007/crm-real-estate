import { SignJWT, jwtVerify } from 'jose';

const TOKEN_ISSUER = 'real-estate-crm-api';
const TOKEN_AUDIENCE = 'real-estate-crm';
export const ACCESS_TOKEN_LIFETIME_SECONDS = 900;

export interface AccessTokenService {
  issue(userId: string): Promise<string>;
  subject(token: string): Promise<string | null>;
}

export function createAccessTokenService(secret: string): AccessTokenService {
  const key = new TextEncoder().encode(secret);

  return {
    issue(userId) {
      return new SignJWT({})
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(userId)
        .setIssuer(TOKEN_ISSUER)
        .setAudience(TOKEN_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_LIFETIME_SECONDS}s`)
        .sign(key);
    },
    async subject(token) {
      try {
        const { payload } = await jwtVerify(token, key, {
          algorithms: ['HS256'],
          issuer: TOKEN_ISSUER,
          audience: TOKEN_AUDIENCE,
        });
        return typeof payload.sub === 'string' ? payload.sub : null;
      } catch {
        return null;
      }
    },
  };
}
