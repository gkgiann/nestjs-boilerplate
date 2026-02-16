import { z } from 'zod';

/**
 * Schema de validação de variáveis de ambiente
 * A aplicação não iniciará se variáveis obrigatórias estiverem faltando ou inválidas
 */
export const envSchema = z.object({
  // Aplicação
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  APP_NAME: z.string().default('nestjs-boilerplate'),
  APP_VERSION: z.string().default('1.0.0'),

  // CORS
  CORS_ORIGINS: z.string().default('*'),

  // Banco de Dados (obrigatório)
  DATABASE_URL: z
    .string({
      message: 'DATABASE_URL is required',
    })
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => url.startsWith('postgresql://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),

  // JWT (obrigatório)
  JWT_ACCESS_SECRET: z
    .string({
      message: 'JWT_ACCESS_SECRET is required',
    })
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string({
      message: 'JWT_REFRESH_SECRET is required',
    })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Segurança de Senha
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(8).max(15)),

  // Logging (registro de logs)
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Limitação de Taxa (Rate Limiting)
  THROTTLE_TTL: z
    .string()
    .default('60')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  THROTTLE_LIMIT: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // Provedor de Pagamento (opcional)
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
