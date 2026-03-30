import type { IncomingMessage, ServerResponse } from "node:http";

import {
  InvalidCredentialsError,
  loginUser,
} from "./application/login-user.js";
import { readJsonBody } from "./http/read-json-body.js";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher.js";
import { PrismaUserRepository } from "./infrastructure/users/prisma-user-repository.js";

export interface AppMetadata {
  name: string;
  service: string;
  version: string;
}

export function createApp(): AppMetadata {
  return {
    name: "USB System Control",
    service: "auth-service",
    version: "0.1.0",
  };
}

export async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method === "GET" && request.url === "/") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", ...createApp() }));
    return;
  }

  if (request.method === "POST" && request.url === "/auth/login") {
    try {
      const body = await readJsonBody<{ email: string; password: string }>(
        request,
      );
      const result = await loginUser(body, {
        userRepository: new PrismaUserRepository(),
        passwordHasher: new BcryptPasswordHasher(),
      });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data: result }));
      return;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              code: "INVALID_CREDENTIALS",
              message: error.message,
            },
          }),
        );
        return;
      }

      if (error instanceof Error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              code: "BAD_REQUEST",
              message: error.message,
            },
          }),
        );
        return;
      }

      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error",
          },
        }),
      );
      return;
    }
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    }),
  );
}
