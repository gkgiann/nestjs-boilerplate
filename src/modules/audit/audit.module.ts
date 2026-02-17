import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './interceptors';

/**
 * Módulo de Auditoria
 *
 * Registra ações importantes do sistema em arquivos locais.
 * Os logs são armazenados no diretório audit-logs/ na raiz do projeto.
 *
 * Para auditar um endpoint, use o decorator @Auditable:
 * @Auditable('create', 'user')
 * async create(...) { ... }
 */
@Global()
@Module({
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
