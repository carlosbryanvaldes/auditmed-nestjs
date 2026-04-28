import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No autenticado');

    // admin:all bypasses all permission checks
    const userPerms: string[] = user.permissions || [];
    if (userPerms.includes('admin:all')) return true;

    const hasAll = required.every((perm) => userPerms.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException(
        `Permiso requerido: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
