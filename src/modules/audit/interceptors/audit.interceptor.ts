import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { AuditService } from '../audit.service';
import { AUDITABLE_KEY, type AuditableOptions } from '../decorators';
import type { CurrentUserData } from '../../auth/decorators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Verifica se o endpoint está marcado como auditável
    const auditableMetadata = this.reflector.get<AuditableOptions>(
      AUDITABLE_KEY,
      context.getHandler(),
    );

    if (!auditableMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const user = request.user as CurrentUserData | undefined;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          // Registra sucesso
          this.auditService.log({
            timestamp: new Date(),
            userId: user?.id,
            userEmail: user?.email,
            action: auditableMetadata.action,
            resource: auditableMetadata.resource,
            method: request.method,
            path: request.path,
            statusCode: response.statusCode,
            ip: request.ip || request.socket.remoteAddress || 'unknown',
            userAgent: request.headers['user-agent'],
            requestId: request.id as string,
            data: {
              body: this.sanitizeData(request.body),
              query: request.query,
              params: request.params,
              duration: Date.now() - startTime,
            },
          });
        },
        error: (error: Error) => {
          // Registra erro
          this.auditService.log({
            timestamp: new Date(),
            userId: user?.id,
            userEmail: user?.email,
            action: auditableMetadata.action,
            resource: auditableMetadata.resource,
            method: request.method,
            path: request.path,
            statusCode: response.statusCode || 500,
            ip: request.ip || request.socket.remoteAddress || 'unknown',
            userAgent: request.headers['user-agent'],
            requestId: request.id as string,
            data: {
              body: this.sanitizeData(request.body),
              query: request.query,
              params: request.params,
              duration: Date.now() - startTime,
            },
            error: error.message,
          });
        },
      }),
    );
  }

  /**
   * Remove dados sensíveis (senhas, tokens) do log
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
