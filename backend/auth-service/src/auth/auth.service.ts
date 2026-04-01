import { Injectable } from "@nestjs/common";

import type { LoginDto } from "./login.dto.js";
import { loginUser } from "./login-user.js";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher.js";
import { PrismaUserRepository } from "./prisma-user.repository.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async login(input: LoginDto) {
    return loginUser(input, {
      userRepository: this.userRepository,
      passwordHasher: this.passwordHasher,
    });
  }
}
