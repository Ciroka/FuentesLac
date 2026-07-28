import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from 'src/users/service/users.service';
import { UserRegisterRequest } from '../dto/request/user-register-request.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt, createHash } from 'crypto';
import { UserRole } from 'src/shared/enums';
import { Payload, AuthResult } from '../types/payload.types';
import { UserLoginRequest } from '../dto/request/user-login.request.dto';
import { UserMeResponse } from '../dto/response/user-me-response.dto';
import { UserMessageResponse } from '../dto/response/user-message-response.dto';
import { EmailSenderService } from 'src/email-sender/service/email-sender.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from 'src/users';

const REFRESH_TOKEN_BYTES = 40;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailSenderService: EmailSenderService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async register(
    userRegister: UserRegisterRequest,
  ): Promise<Pick<AuthResult, 'user'>> {
    const exist = await this.usersService.existsByEmail(userRegister.email);
    if (exist) throw new ConflictException('Email already exists.');

    const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? 12);
    const passwordHash = await bcrypt.hash(userRegister.password, rounds);
    const countUsers = await this.usersService.count();

    const role = countUsers === 0 ? UserRole.ADMIN : UserRole.EMPLOYEE;
    const verificationToken = crypto.randomUUID();

    const user = await this.usersService.register({
      name: userRegister.name.trim(),
      email: userRegister.email.trim().toLowerCase(),
      passwordHash,
      role,
      verificationToken,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(userLogin: UserLoginRequest): Promise<AuthResult> {
    const user = await this.usersService.findOneByEmailWithPassword(
      userLogin.email.trim().toLowerCase(),
    );
    const passwordHash = user
      ? user.passwordHash
      : '$2b$12$invalidhashforsecuritypurposesdummy';

    const ok = await bcrypt.compare(userLogin.password, passwordHash);
    if (!user || !ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueTokens(user);
  }

  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) throw new UnauthorizedException('Missing refresh token');

    const tokenHash = this.hashToken(rawToken);
    const existing = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
    });

    if (!existing) throw new UnauthorizedException('Invalid refresh token');

    if (existing.revokedAt) {
      await this.refreshTokenRepo.update(
        { userId: existing.userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    existing.revokedAt = new Date();
    await this.refreshTokenRepo.save(existing);

    const user = await this.usersService
      .findOneById(existing.userId)
      .catch(() => {
        throw new UnauthorizedException('User not found');
      });
    return this.issueTokens(user);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;

    await this.refreshTokenRepo.update(
      { tokenHash: this.hashToken(rawToken) },
      { revokedAt: new Date() },
    );
  }

  async me(userId: string): Promise<UserMeResponse> {
    try {
      const user = await this.usersService.findOneById(userId);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(email: string): Promise<UserMessageResponse> {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      const code = randomInt(100000, 999999).toString();
      const codeHash = await bcrypt.hash(code, 10);
      const resetCodePasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

      user.codeHashResetPassword = codeHash;
      user.resetCodePasswordExpires = resetCodePasswordExpires;
      await this.usersService.save(user);
      await this.emailSenderService.sendResetCode(email, code);
    }
    return { message: 'Si el email existe, recibirás un link' };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<UserMessageResponse> {
    const user = await this.usersService.findOneByResetPasswordToken(token);

    if (
      !user ||
      !user.resetCodePasswordExpires ||
      user.resetCodePasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const rounds = Number(
      this.configService.get<string>('BCRYPT_COST') ?? '12',
    );

    user.passwordHash = await bcrypt.hash(password, rounds);
    user.resetCodePasswordExpires = null;
    user.codeHashResetPassword = null;
    await this.usersService.save(user);

    return { message: 'Contraseña actualizada' };
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const payload: Payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.issueRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      access_token,
      refresh_token,
    };
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const expiresDays = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_DAYS') ?? 7,
    );

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
        revokedAt: null,
      }),
    );

    return rawToken;
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
