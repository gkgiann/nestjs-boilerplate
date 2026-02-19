import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { ConfigProvidersModule } from './config/config-providers.module';
import { TypedConfigService } from './config/typed-config.service';
import { DatabaseModule } from './core/database';
import { LoggerModule } from './core/logger';
import { AuditModule } from './modules/audit';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule,
    // Rate Limiting Global
    ThrottlerModule.forRootAsync({
      imports: [ConfigProvidersModule],
      inject: [TypedConfigService],
      useFactory: (configService: TypedConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.throttle.ttl * 1000, // Converter para milissegundos
            limit: configService.throttle.limit,
          },
          {
            name: 'auth',
            ttl: configService.authThrottle.ttl * 1000, // Converter para milissegundos
            limit: configService.authThrottle.limit,
          },
        ],
      }),
    }),
    DatabaseModule,
    LoggerModule,
    AuditModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    // Rate Limiting Guard Global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
