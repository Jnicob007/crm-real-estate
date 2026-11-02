import argon2 from 'argon2';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
}

export const passwordHasher: PasswordHasher = {
  hash(password) {
    return argon2.hash(password, { type: argon2.argon2id });
  },
  verify(passwordHash, password) {
    return argon2.verify(passwordHash, password);
  },
};
