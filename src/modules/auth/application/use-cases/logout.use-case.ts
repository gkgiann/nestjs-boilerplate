import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '@modules/auth/infra/repositories';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  /**
   * Log out user from all devices by revoking all refresh tokens
   */
  async execute(userId: string): Promise<void> {
    // Revoke all refresh tokens for this user
    // This effectively logs the user out from all devices
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    // Note: Access tokens remain valid until they expire (stateless)
    // In a production environment you might want to:
    // 1. Add access tokens to a blacklist in Redis
    // 2. Use shorter expiration times for access tokens
    // 3. Implement token versioning
  }

  /**
   * Log out user from current device only (if token hash is provided)
   */
  async executeFromDevice(userId: string, tokenHash: string): Promise<void> {
    // Revoke only the specific refresh token
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }
}
