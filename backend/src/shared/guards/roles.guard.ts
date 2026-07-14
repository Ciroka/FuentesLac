import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!required?.length) return true;
        
        const req = context.switchToHttp().getRequest();
        const role = req.user?.role as UserRole | undefined;

        return !!role && required.includes(role);
    }
}