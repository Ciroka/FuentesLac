import { Body, Controller, Get, Post, Request } from '@nestjs/common';

import {
  UserLoginRequest,
  UserRegisterRequest,
  UserResetPasswordRequest,
  UserEmailRequest,
  UserLoginResponse,
  UserMeResponse,
  UserRegisterResponse,
  UserMessageResponse,
} from '../dto';
import { AuthService } from '../service/auth.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async me(@Request() req: any): Promise<UserMeResponse> {
    return this.authService.me(req.user.sub);
  }

  @Roles(UserRole.ADMIN)
  @Post('register')
  async register(
    @Body() userRegister: UserRegisterRequest,
  ): Promise<UserRegisterResponse> {
    return this.authService.register(userRegister);
  }

  @Public()
  @Post('login')
  async login(@Body() userLogin: UserLoginRequest): Promise<UserLoginResponse> {
    return this.authService.login(userLogin);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: UserEmailRequest,
  ): Promise<UserMessageResponse> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: UserResetPasswordRequest,
  ): Promise<UserMessageResponse> {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
