import { registerAs } from '@nestjs/config';

/**
 * Application configuration
 * Type-safe configuration factory using validated environment variables
 */
export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(process.env.PORT || '3000', 10),
    name: process.env.APP_NAME || 'nestjs-boilerplate',
    version: process.env.APP_VERSION || '1.0.0',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  }),
);

/**
 * Database configuration
 */
export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL as string,
  }),
);

/**
 * JWT configuration
 */
export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  }),
);

/**
 * Security configuration
 */
export const securityConfig = registerAs(
  'security',
  (): SecurityConfig => ({
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  }),
);

/**
 * Logging configuration
 */
export const loggingConfig = registerAs(
  'logging',
  (): LoggingConfig => ({
    level: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
  }),
);

/**
 * Throttle configuration
 */
export const throttleConfig = registerAs(
  'throttle',
  (): ThrottleConfig => ({
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  }),
);

/**
 * Payment provider configuration
 */
export const paymentConfig = registerAs(
  'payment',
  (): PaymentConfig => ({
    apiKey: process.env.PAYMENT_PROVIDER_API_KEY,
    webhookSecret: process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET,
  }),
);

// Definições de tipos
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  name: string;
  version: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  accessSecret: string;
  accessExpiration: string;
  refreshSecret: string;
  refreshExpiration: string;
}

export interface SecurityConfig {
  bcryptSaltRounds: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export interface PaymentConfig {
  apiKey?: string;
  webhookSecret?: string;
}

/**
 * All configuration modules
 */
export const configurations = [
  appConfig,
  databaseConfig,
  jwtConfig,
  securityConfig,
  loggingConfig,
  throttleConfig,
  paymentConfig,
];
