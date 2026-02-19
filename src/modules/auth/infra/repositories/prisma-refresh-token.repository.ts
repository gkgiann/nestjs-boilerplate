import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import {
  CreateRefreshTokenData,
  IRefreshTokenRepository,
  RefreshTokenEntity,
} from '@modules/auth/domain/repositories';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar um novo refresh token
   */
  async create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity> {
    return this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        device: data.device,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Buscar um refresh token pelo seu hash
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Buscar todos os refresh tokens válidos de um usuário (suporta múltiplos dispositivos)
   */
  async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Revogar um refresh token específico
   */
  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Revogar todos os refresh tokens de um usuário (logout de todos os dispositivos)
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Deletar um refresh token específico pelo hash
   */
  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
  }

  /**
   * Deletar todos os refresh tokens de um usuário
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Deletar todos os refresh tokens expirados (job de limpeza)
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Deletar todos os refresh tokens revogados (job de limpeza)
   */
  async deleteRevoked(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        isRevoked: true,
      },
    });

    return result.count;
  }
}
