export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  device: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity>;

  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;

  findByUserId(userId: string): Promise<RefreshTokenEntity[]>;

  revokeByTokenHash(tokenHash: string): Promise<void>;

  revokeAllByUserId(userId: string): Promise<void>;

  deleteByTokenHash(tokenHash: string): Promise<void>;

  deleteAllByUserId(userId: string): Promise<void>;

  deleteExpired(): Promise<number>;

  deleteRevoked(): Promise<number>;
}
