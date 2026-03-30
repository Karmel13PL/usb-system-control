import { describe, expect, it } from "vitest";

import {
  InvalidCredentialsError,
  loginUser,
} from "../../application/login-user.js";
import type { User } from "../../domain/users/user.js";

class InMemoryUserRepository {
  constructor(private readonly user: User | null) {}

  async findByEmail(): Promise<User | null> {
    return this.user;
  }
}

class FakePasswordHasher {
  constructor(private readonly shouldMatch: boolean) {}

  async compare(): Promise<boolean> {
    return this.shouldMatch;
  }
}

describe("loginUser", () => {
  it("returns public user data for valid credentials", async () => {
    const result = await loginUser(
      {
        email: "admin@example.com",
        password: "Admin123!",
      },
      {
        userRepository: new InMemoryUserRepository({
          id: "user-1",
          email: "admin@example.com",
          passwordHash: "hashed-password",
          role: "admin",
        }),
        passwordHasher: new FakePasswordHasher(true),
      },
    );

    expect(result).toEqual({
      user: {
        id: "user-1",
        email: "admin@example.com",
        role: "admin",
      },
    });
  });

  it("throws when user does not exist", async () => {
    await expect(
      loginUser(
        {
          email: "missing@example.com",
          password: "Admin123!",
        },
        {
          userRepository: new InMemoryUserRepository(null),
          passwordHasher: new FakePasswordHasher(true),
        },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("throws when password is invalid", async () => {
    await expect(
      loginUser(
        {
          email: "admin@example.com",
          password: "wrong-password",
        },
        {
          userRepository: new InMemoryUserRepository({
            id: "user-1",
            email: "admin@example.com",
            passwordHash: "hashed-password",
            role: "admin",
          }),
          passwordHasher: new FakePasswordHasher(false),
        },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("throws when email or password is missing", async () => {
    await expect(
      loginUser(
        {
          email: "",
          password: "",
        },
        {
          userRepository: new InMemoryUserRepository(null),
          passwordHasher: new FakePasswordHasher(false),
        },
      ),
    ).rejects.toThrow("Email and password are required");
  });
});
