import type { User } from "../domain/users/user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
}

export interface PasswordHasher {
  compare(plainText: string, hash: string): Promise<boolean>;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserSuccess {
  user: {
    id: string;
    email: string;
    role: "admin";
  };
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export function validateLoginUserInput(input: LoginUserInput): void {
  if (!input.email || !input.password) {
    throw new Error("Email and password are required");
  }
}

export async function loginUser(
  input: LoginUserInput,
  dependencies: {
    userRepository: UserRepository;
    passwordHasher: PasswordHasher;
  },
): Promise<LoginUserSuccess> {
  validateLoginUserInput(input);

  const user = await dependencies.userRepository.findByEmail(input.email);

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await dependencies.passwordHasher.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
