import { Injectable } from "@nestjs/common";

import type { PasswordHasher } from "./auth.types.js";
import bcrypt from "bcryptjs";

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
