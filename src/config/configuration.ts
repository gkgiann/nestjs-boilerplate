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
    secret: process.env.JWT_SECRET as string,
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
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

// Type definitions
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiration: string;
  refreshSecret: string;
  refreshExpiration: string;
}

export interface PaymentConfig {
  apiKey?: string;
  webhookSecret?: string;
}

/**
 * All configuration modules
 */
export const configurations = [appConfig, databaseConfig, jwtConfig, paymentConfig];
