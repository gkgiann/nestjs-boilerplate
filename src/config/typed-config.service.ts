import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  SecurityConfig,
  LoggingConfig,
  ThrottleConfig,
  AuthThrottleConfig,
} from './configuration';

/**
 * Serviço de configuração com tipagem segura
 * Fornece acesso fortemente tipado aos valores de configuração
 *
 * Exemplo de uso:
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

  get security(): SecurityConfig {
    return this.configService.get<SecurityConfig>('security') as SecurityConfig;
  }

  get logging(): LoggingConfig {
    return this.configService.get<LoggingConfig>('logging') as LoggingConfig;
  }

  get throttle(): ThrottleConfig {
    return this.configService.get<ThrottleConfig>('throttle') as ThrottleConfig;
  }

  get authThrottle(): AuthThrottleConfig {
    return this.configService.get<AuthThrottleConfig>('authThrottle') as AuthThrottleConfig;
  }

  /**
   * Verificar se a aplicação está rodando em modo de produção
   */
  get isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  /**
   * Verificar se a aplicação está rodando em modo de desenvolvimento
   */
  get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  /**
   * Verificar se a aplicação está rodando em modo de teste
   */
  get isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }
}
