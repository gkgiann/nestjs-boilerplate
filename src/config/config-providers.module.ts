import { Module } from '@nestjs/common';
import { TypedConfigService } from './typed-config.service';

/**
 * Configuration providers module
 * Import this module if you need TypedConfigService in a non-global context
 * Note: ConfigModule is already global, this is only needed for TypedConfigService
 */
@Module({
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class ConfigProvidersModule {}
