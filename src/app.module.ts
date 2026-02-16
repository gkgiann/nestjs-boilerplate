import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './core/database';
import { LoggerModule } from './core/logger';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule, HealthModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
