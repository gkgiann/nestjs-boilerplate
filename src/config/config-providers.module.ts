import { Module } from '@nestjs/common';
import { TypedConfigService } from './typed-config.service';

/**
 * Módulo de provedores de configuração
 * Importe este módulo se precisar de TypedConfigService em um contexto não-global
 * Nota: ConfigModule já é global, isto só é necessário para TypedConfigService
 */
@Module({
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class ConfigProvidersModule {}
