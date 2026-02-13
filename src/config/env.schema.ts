import { z } from 'zod';

/**
 * Environment variables validation schema
 * The app will not start if required variables are missing or invalid
 */
export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // CORS
  CORS_ORIGINS: z.string().default('*'),

  // Database (required)
  DATABASE_URL: z
    .string({
      message: 'DATABASE_URL is required',
    })
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => url.startsWith('postgresql://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),

  // JWT (required)
  JWT_SECRET: z
    .string({
      message: 'JWT_SECRET is required',
    })
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string({
      message: 'JWT_REFRESH_SECRET is required',
    })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Payment Provider (optional)
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
