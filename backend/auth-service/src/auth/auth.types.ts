export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin";
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

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
}

export interface PasswordHasher {
  compare(plainText: string, hash: string): Promise<boolean>;
}
