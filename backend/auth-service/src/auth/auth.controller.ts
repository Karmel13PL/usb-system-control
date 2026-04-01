import { Body, Controller, HttpCode, Post, UnauthorizedException } from "@nestjs/common";

import { AuthService } from "./auth.service.js";
import { InvalidCredentialsError } from "./auth.errors.js";
import { LoginDto } from "./login.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    try {
      const result = await this.authService.login(body);
      return { data: result };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException({
          code: "INVALID_CREDENTIALS",
          message: error.message,
        });
      }

      throw error;
    }
  }
}
