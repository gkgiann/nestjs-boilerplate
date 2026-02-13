import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // CORS
  CORS_ORIGINS: z.string().default('*'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Payment Provider (example: Stripe, Mercado Pago)
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
