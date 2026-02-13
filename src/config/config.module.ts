import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { configurations } from './configuration';

/**
 * Global configuration module
 * Validates environment variables on startup and provides type-safe config access
 */
export const ConfigModule = NestConfigModule.forRoot({
  isGlobal: true,
  load: configurations,
  validate: (config) => {
    try {
      return envSchema.parse(config);
    } catch (error) {
      console.error('❌ Environment validation failed:');
      console.error(error);
      throw new Error('Invalid environment configuration - check .env file');
    }
  },
  validationOptions: {
    abortEarly: false, // Show all validation errors
  },
});
