import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from '@config/typed-config.service';
import { type IUsersRepository } from '@modules/users/domain/repositories';

export interface JwtPayload {
  sub: string; // ID do usuário
  email: string;
  role: string;
}

export interface ValidatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('UsersRepository') private readonly usersRepository: IUsersRepository,
    private readonly config: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
    });
  }

  /**
   * Valida o payload do JWT e retorna o usuário
   * Este método é chamado automaticamente pelo Passport após verificar a assinatura do JWT
   */
  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    // 1. Buscar usuário no banco de dados pelo ID do payload do token
    const user = await this.usersRepository.findById(payload.sub);

    // 2. Validar que o usuário existe
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 3. Validar que o usuário está ativo
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // 4. Validar que o email não mudou (verificação de segurança)
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token email mismatch');
    }

    // 5. Retornar dados do usuário (será anexado a request.user)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
