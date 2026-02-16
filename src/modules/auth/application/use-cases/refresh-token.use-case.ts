import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { RefreshTokenDto } from '@modules/auth/dto';
import { RefreshTokenInvalidError } from '@modules/auth/domain/errors';
import { AuthService } from '@modules/auth/auth.service';
import { RefreshTokenRepository } from '@modules/auth/infra/repositories';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(data: RefreshTokenDto): Promise<RefreshTokenResult> {
    // 1. Fazer hash do refresh token recebido
    const tokenHash = await this.authService.hashRefreshToken(data.refreshToken);

    // 2. Buscar refresh token no banco de dados pelo hash
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    // 3. Validar que o token existe e não está expirado
    if (!storedToken) {
      throw new RefreshTokenInvalidError();
    }

    // 4. Verificar se o token está expirado (verificação adicional, o repositório já deveria filtrar)
    if (storedToken.expiresAt < new Date()) {
      // Limpar token expirado
      await this.refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw new RefreshTokenInvalidError();
    }

    // 5. Verificar se o token foi revogado
    if (storedToken.isRevoked) {
      throw new RefreshTokenInvalidError();
    }

    // 6. Obter usuário associado
    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user || !user.isActive) {
      throw new RefreshTokenInvalidError();
    }

    // 7. Gerar novos tokens (rotação de refresh token)
    const newTokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 8. Deletar refresh token antigo (rotação)
    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);

    // 9. Salvar novo refresh token no banco de dados
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokens.refreshTokenHash,
      expiresAt: newTokens.refreshTokenExpiresAt,
      device: storedToken.device || undefined,
      ipAddress: storedToken.ipAddress || undefined,
      userAgent: storedToken.userAgent || undefined,
    });

    // 10. Retornar novos tokens
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
}
