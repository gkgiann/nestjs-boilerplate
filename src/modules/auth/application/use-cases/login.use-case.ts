import { Injectable, Inject } from '@nestjs/common';
import { type PasswordHasher } from '@common/security';
import { LoginDto } from '@modules/auth/dto';
import { InvalidCredentialsError } from '@modules/auth/domain/errors';
import { AuthService } from '@modules/auth/auth.service';
import { type IRefreshTokenRepository } from '@modules/auth/domain/repositories';
import { type IUsersRepository } from '@modules/users/domain/repositories';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    private readonly authService: AuthService,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(data: LoginDto): Promise<LoginResult> {
    // 1. Buscar usuário por email
    const user = await this.usersRepository.findByEmail(data.email);

    // 2. Verificar se o usuário existe
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 3. Verificar se o usuário está ativo
    if (!user.isActive) {
      throw new InvalidCredentialsError();
    }

    // 4. Comparar hash da senha
    const isPasswordValid = await this.passwordHasher.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 5. Gerar tokens de acesso e refresh
    const tokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Salvar refresh token no banco de dados
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    // 7. Retornar tokens e dados do usuário (sem a senha)
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
