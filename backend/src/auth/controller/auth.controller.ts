import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest, Response } from 'express';

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
import { UserChangePasswordDto } from 'src/users/dto';
import { AuthService } from '../service/auth.service';
import { UsersService } from 'src/users/service/users.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';
import type { AuthenticatedRequest } from '../dto/request/user-request.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_PATH = '/auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  async me(@Request() req: AuthenticatedRequest): Promise<UserMeResponse> {
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
  async login(
    @Body() userLogin: UserLoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserLoginResponse> {
    const { user, access_token, refresh_token } =
      await this.authService.login(userLogin);
    this.setAuthCookies(res, access_token, refresh_token);
    return { user };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserLoginResponse> {
    const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    const { user, access_token, refresh_token } =
      await this.authService.refresh(rawToken);
    this.setAuthCookies(res, access_token, refresh_token);
    return { user };
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserMessageResponse> {
    const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    await this.authService.logout(rawToken);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_TOKEN_PATH });
    return { message: 'Sesión cerrada' };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: UserEmailRequest,
  ): Promise<UserMessageResponse> {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: UserResetPasswordRequest,
  ): Promise<UserMessageResponse> {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Patch('me/password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UserChangePasswordDto,
  ): Promise<UserMessageResponse> {
    return this.usersService.updatePassword(req.user.sub, dto);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const accessExpiresSec = Number(
      this.configService.get<string>('JWT_EXPIRES_SEC') ?? 900,
    );
    const refreshExpiresDays = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_DAYS') ?? 7,
    );

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessExpiresSec * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: REFRESH_TOKEN_PATH,
      maxAge: refreshExpiresDays * 24 * 60 * 60 * 1000,
    });
  }
}
