import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_KEY = 'auditable';

export interface AuditableOptions {
  action: string;
  resource: string;
}

/**
 * Decorator para marcar endpoints que devem ser auditados
 * @param action - Ação sendo realizada (ex: 'create', 'update', 'delete')
 * @param resource - Recurso sendo manipulado (ex: 'user', 'post')
 */
export const Auditable = (action: string, resource: string) =>
  SetMetadata(AUDITABLE_KEY, { action, resource } as AuditableOptions);
