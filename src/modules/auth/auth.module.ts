import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from '@core/database';
import { ConfigProvidersModule } from '@config/config-providers.module';
import { TypedConfigService } from '@config/typed-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Casos de Uso
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from './application/use-cases';

// Repositórios
import { RefreshTokenRepository } from './infra/repositories';

// Guards
import { JwtAuthGuard, RolesGuard } from './guards';

// Estratégias
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

    // Casos de Uso
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,

    // Repositórios
    RefreshTokenRepository,

    // Guards
    JwtAuthGuard,
    RolesGuard,

    // Estratégias
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
