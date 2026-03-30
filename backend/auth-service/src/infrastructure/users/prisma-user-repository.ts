import type { UserRepository } from "../../application/login-user.js";
import { prisma } from "../database/prisma.js";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });
  }
}
