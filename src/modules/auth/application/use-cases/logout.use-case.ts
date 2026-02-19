import { type IRefreshTokenRepository } from '@modules/auth/domain/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  /**
   * Deslogar usuário de todos os dispositivos revogando todos os refresh tokens
   */
  async execute(userId: string): Promise<void> {
    // Revogar todos os refresh tokens deste usuário
    // Isso efetivamente desloga o usuário de todos os dispositivos
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    // Nota: Access tokens permanecem válidos até expirarem (stateless)
    // Em um ambiente de produção você pode querer:
    // 1. Adicionar access tokens a uma blacklist no Redis
    // 2. Usar tempos de expiração mais curtos para access tokens
    // 3. Implementar versionamento de tokens
  }

  /**
   * Deslogar usuário apenas do dispositivo atual (se o hash do token for fornecido)
   */
  async executeFromDevice(userId: string, tokenHash: string): Promise<void> {
    // Revogar apenas o refresh token específico
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }
}
