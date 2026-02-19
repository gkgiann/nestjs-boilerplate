import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from '@config/typed-config.service';
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
   * Gerar tokens de acesso e refresh para um usuário
   */
  async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const jwtPayload: JwtPayload = {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // Gerar access token (curta duração)
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessExpiration as any,
    });

    // Gerar refresh token (longa duração) - string aleatória
    const refreshToken = this.generateRefreshToken();

    // Fazer hash do refresh token antes de armazenar
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);

    // Calcular expiração do refresh token
    const refreshTokenExpiresAt = this.calculateRefreshTokenExpiration();

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }

  /**
   * Verificar e decodificar um access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.jwt.accessSecret,
    });
  }

  /**
   * Gerar um refresh token criptograficamente seguro
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Fazer hash de um refresh token usando SHA256
   */
  async hashRefreshToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Calcular data de expiração do refresh token
   */
  private calculateRefreshTokenExpiration(): Date {
    const expirationString = this.config.jwt.refreshExpiration;
    const expirationMs = this.parseExpirationToMs(expirationString);
    return new Date(Date.now() + expirationMs);
  }

  /**
   * Converter string de expiração (ex: "7d", "24h") para milissegundos
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
