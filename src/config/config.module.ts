import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

export const ConfigModule = NestConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => envSchema.parse(config),
});
