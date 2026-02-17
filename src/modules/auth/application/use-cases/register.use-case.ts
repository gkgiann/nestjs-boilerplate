import { Injectable, Inject } from '@nestjs/common';
import { type PasswordHasher } from '@common/security';
import { RegisterDto } from '@modules/auth/dto';
import { UserAlreadyExistsError } from '@modules/auth/domain/errors';
import { AuthService } from '@modules/auth/auth.service';
import { type IRefreshTokenRepository } from '@modules/auth/domain/repositories';
import { type IUsersRepository } from '@modules/users/domain/repositories';

export interface RegisterResult {
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
export class RegisterUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    private readonly authService: AuthService,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(data: RegisterDto): Promise<RegisterResult> {
    // 1. Verificar se o usuário já existe
    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    // 2. Fazer hash da senha
    const hashedPassword = await this.passwordHasher.hash(data.password);

    // 3. Criar usuário no banco de dados
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'USER', // Role padrão
    });

    // 4. Gerar tokens de acesso e refresh
    const tokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Salvar refresh token no banco de dados
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    // 6. Retornar tokens e dados do usuário (sem a senha)
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
