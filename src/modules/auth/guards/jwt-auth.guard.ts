import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // TODO: Adicionar lógica customizada se necessário
    // Por exemplo: verificar se token está em blacklist
    return super.canActivate(context);
  }
}
