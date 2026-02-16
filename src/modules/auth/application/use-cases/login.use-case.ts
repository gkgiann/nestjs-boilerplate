import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { LoginDto } from '@modules/auth/dto';
import { InvalidCredentialsError } from '@modules/auth/domain/errors';
import { AuthService } from '@modules/auth/auth.service';
import { RefreshTokenRepository } from '@modules/auth/infra/repositories';

export interface LoginResult {
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
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(data: LoginDto): Promise<LoginResult> {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. Check if user exists
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 3. Check if user is active
    if (!user.isActive) {
      throw new InvalidCredentialsError();
    }

    // 4. Compare password hash
    const isPasswordValid = await this.authService.comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 5. Generate access and refresh tokens
    const tokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Save refresh token to database
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    // 7. Return tokens and user data (without password)
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
