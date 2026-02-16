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
    // 1. Hash the incoming refresh token
    const tokenHash = await this.authService.hashRefreshToken(data.refreshToken);

    // 2. Find refresh token in database by hash
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    // 3. Validate token exists and is not expired
    if (!storedToken) {
      throw new RefreshTokenInvalidError();
    }

    // 4. Check if token is expired (double check, repository should filter)
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw new RefreshTokenInvalidError();
    }

    // 5. Check if token is revoked
    if (storedToken.isRevoked) {
      throw new RefreshTokenInvalidError();
    }

    // 6. Get associated user
    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user || !user.isActive) {
      throw new RefreshTokenInvalidError();
    }

    // 7. Generate new tokens (refresh token rotation)
    const newTokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 8. Delete old refresh token (rotation)
    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);

    // 9. Save new refresh token to database
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokens.refreshTokenHash,
      expiresAt: newTokens.refreshTokenExpiresAt,
      device: storedToken.device || undefined,
      ipAddress: storedToken.ipAddress || undefined,
      userAgent: storedToken.userAgent || undefined,
    });

    // 10. Return new tokens
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
}
