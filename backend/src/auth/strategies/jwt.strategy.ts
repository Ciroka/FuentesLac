import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { User } from 'src/users';
import { Repository } from 'typeorm';

const extractFromCookie = (req: Request): string | null => {
  return (req?.cookies?.access_token as string | undefined) ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return { sub: user.id, role: user.role, email: user.email };
  }
}
