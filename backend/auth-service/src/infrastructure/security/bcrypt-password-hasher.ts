import bcrypt from "bcryptjs";

import type { PasswordHasher } from "../../application/login-user.js";

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
