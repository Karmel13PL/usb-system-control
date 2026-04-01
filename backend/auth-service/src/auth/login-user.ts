import type {
  LoginUserInput,
  LoginUserSuccess,
  PasswordHasher,
  UserRepository,
} from "./auth.types.js";
import { InvalidCredentialsError } from "./auth.errors.js";

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
