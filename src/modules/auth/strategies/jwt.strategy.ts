import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@core/database';
import { TypedConfigService } from '@config/typed-config.service';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
}

export interface ValidatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
    });
  }

  /**
   * Validates the JWT payload and returns the user
   * This method is called automatically by Passport after verifying the JWT signature
   */
  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    // 1. Find user in database by ID from token payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // 2. Validate user exists
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 3. Validate user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // 4. Validate email hasn't changed (security check)
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token email mismatch');
    }

    // 5. Return user data (will be attached to request.user)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
