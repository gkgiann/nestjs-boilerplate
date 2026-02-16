import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from '@core/database';
import { SecurityModule } from '@common/security';
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
import { PrismaRefreshTokenRepository } from './infra/repositories';

// Guards
import { JwtAuthGuard, RolesGuard } from './guards';

// Estratégias
import { JwtStrategy } from './strategies';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
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
    UsersModule,
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
    {
      provide: 'RefreshTokenRepository',
      useClass: PrismaRefreshTokenRepository,
    },

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
