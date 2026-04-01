import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher.js";
import { PrismaUserRepository } from "./prisma-user.repository.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, PrismaUserRepository, BcryptPasswordHasher],
})
export class AuthModule {}
