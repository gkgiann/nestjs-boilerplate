import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, DatabaseConfig, JwtConfig, PaymentConfig } from './configuration';

/**
 * Type-safe configuration service
 * Provides strongly-typed access to configuration values
 *
 * Usage example:
 * ```typescript
 * constructor(private configService: TypedConfigService) {}
 *
 * const port = this.configService.app.port;
 * const dbUrl = this.configService.database.url;
 * ```
 */
@Injectable()
export class TypedConfigService {
  constructor(private configService: ConfigService) {}

  get app(): AppConfig {
    return this.configService.get<AppConfig>('app') as AppConfig;
  }

  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database') as DatabaseConfig;
  }

  get jwt(): JwtConfig {
    return this.configService.get<JwtConfig>('jwt') as JwtConfig;
  }

  get payment(): PaymentConfig {
    return this.configService.get<PaymentConfig>('payment') as PaymentConfig;
  }

  /**
   * Check if application is running in production mode
   */
  get isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  /**
   * Check if application is running in development mode
   */
  get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  /**
   * Check if application is running in test mode
   */
  get isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }
}
