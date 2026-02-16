import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from '@config/typed-config.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: TypedConfigService,
  ) {}

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const jwtPayload: JwtPayload = {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // Generate access token (short-lived)
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessExpiration as any,
    });

    // Generate refresh token (long-lived) - random string
    const refreshToken = this.generateRefreshToken();

    // Hash the refresh token before storing
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);

    // Calculate refresh token expiration
    const refreshTokenExpiresAt = this.calculateRefreshTokenExpiration();

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.security.bcryptSaltRounds);
  }

  /**
   * Compare a plain password with a hashed password
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Verify and decode an access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.jwt.accessSecret,
    });
  }

  /**
   * Generate a cryptographically secure refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Hash a refresh token using SHA256
   */
  async hashRefreshToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Calculate refresh token expiration date
   */
  private calculateRefreshTokenExpiration(): Date {
    const expirationString = this.config.jwt.refreshExpiration;
    const expirationMs = this.parseExpirationToMs(expirationString);
    return new Date(Date.now() + expirationMs);
  }

  /**
   * Parse expiration string (e.g., "7d", "24h") to milliseconds
   */
  private parseExpirationToMs(expiration: string): number {
    const value = parseInt(expiration.slice(0, -1), 10);
    const unit = expiration.slice(-1);

    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (units[unit] || units.d);
  }
}
