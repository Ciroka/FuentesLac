import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/service/users.service';
import { UserRegisterRequest } from '../dto/request/user-register-request.dto';
import { UserRegisterResponse } from '../dto/response/user-register-response.dto';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UserRole } from 'src/shared/enums';
import { Payload } from '../types/payload.types';
import { UserLoginRequest } from '../dto/request/user-login.request.dto';
import { UserLoginResponse } from '../dto/response/user-login-response.dto';
import { UserMeResponse } from '../dto/response/user-me-response.dto';
import { UserMessageResponse } from '../dto/response/user-message-response.dto';
import { EmailSenderService } from 'src/email-sender/service/email-sender.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async register(
    userRegister: UserRegisterRequest,
  ): Promise<UserRegisterResponse> {
    const exist = await this.usersService.existsByEmail(userRegister.email);
    if (exist) throw new ConflictException('Email already exists.');

    const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? 12);
    const passwordHash = await bcrypt.hash(userRegister.password, rounds);
    const countUsers = await this.usersService.count();

    const role = countUsers === 0 ? UserRole.ADMIN : UserRole.EMPLOYEE;
    const verificationToken = crypto.randomUUID();

    const user = await this.usersService.register({
      email: userRegister.email.trim().toLowerCase(),
      passwordHash,
      role,
      verificationToken,
    });

    const payload: Payload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      access_token,
    };
  }

  async login(userLogin: UserLoginRequest): Promise<UserLoginResponse> {
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

    const payload: Payload = {
      sub: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      access_token,
    };
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
}
