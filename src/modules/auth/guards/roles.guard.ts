import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obter roles necessários dos metadados (definidos pelo decorator @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nenhum role é necessário, permitir acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Obter usuário da requisição (anexado pelo JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Usuário deve existir porque JwtAuthGuard executa antes de RolesGuard
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // 3. Verificar se o role do usuário está nos roles permitidos
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `User with role '${user.role}' does not have access to this resource`,
      );
    }

    return true;
  }
}
