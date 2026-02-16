import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from '@core/database';
import { ConfigProvidersModule } from '@config/config-providers.module';
import { TypedConfigService } from '@config/typed-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Use Cases
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from './application/use-cases';

// Repositories
import { RefreshTokenRepository } from './infra/repositories';

// Guards
import { JwtAuthGuard, RolesGuard } from './guards';

// Strategies
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    DatabaseModule,
    ConfigProvidersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigProvidersModule],
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.jwt.accessSecret,
        signOptions: {
          expiresIn: config.jwt.accessExpiration as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Service
    AuthService,

    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,

    // Repositories
    RefreshTokenRepository,

    // Guards
    JwtAuthGuard,
    RolesGuard,

    // Strategies
    JwtStrategy,
  ],
  exports: [
    // Exportar guards e decorators para uso em outros módulos
    JwtAuthGuard,
    RolesGuard,
    AuthService,
  ],
})
export class AuthModule {}
