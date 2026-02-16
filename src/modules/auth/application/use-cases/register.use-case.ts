import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { RegisterDto } from '@modules/auth/dto';
import { UserAlreadyExistsError } from '@modules/auth/domain/errors';
import { AuthService } from '@modules/auth/auth.service';
import { RefreshTokenRepository } from '@modules/auth/infra/repositories';

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
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(data: RegisterDto): Promise<RegisterResult> {
    // 1. Verificar se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    // 2. Fazer hash da senha
    const hashedPassword = await this.authService.hashPassword(data.password);

    // 3. Criar usuário no banco de dados
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'USER', // Role padrão
      },
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
