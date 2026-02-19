import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { configurations } from './configuration';

/**
 * Módulo de configuração global
 * Valida variáveis de ambiente na inicialização e fornece acesso com tipagem segura
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
    abortEarly: false, // Mostrar todos os erros de validação
  },
});
