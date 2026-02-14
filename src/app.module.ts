import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './core/database';
import { LoggerModule } from './core/logger';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
