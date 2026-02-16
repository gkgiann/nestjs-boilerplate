import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { Prisma } from '../../../generated/prisma/client';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        errorCode = (responseObj.error as string) || exception.constructor.name;
        details = responseObj.details;
      } else {
        message = exception.message;
      }

      // Logar exceções HTTP esperadas como avisos
      if (status >= HttpStatus.BAD_REQUEST && status < HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.warn({
          msg: 'Client error',
          error: {
            code: errorCode,
            message,
            statusCode: status,
          },
          method: request.method,
          url: request.url,
          ip: request.ip,
        });
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Tratar erros conhecidos do Prisma
      const prismaError = exception;

      switch (prismaError.code) {
        case 'P2002':
          // Violação de restrição de unicidade
          status = HttpStatus.CONFLICT;
          errorCode = 'DUPLICATE_ENTRY';
          message = 'A record with this value already exists';
          details = {
            fields: prismaError.meta?.target,
          };
          break;
        case 'P2025':
          // Registro não encontrado
          status = HttpStatus.NOT_FOUND;
          errorCode = 'NOT_FOUND';
          message = 'Record not found';
          break;
        case 'P2003':
          // Violação de restrição de chave estrangeira
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'FOREIGN_KEY_VIOLATION';
          message = 'Related record does not exist';
          details = {
            field: prismaError.meta?.field_name,
          };
          break;
        case 'P2014':
          // ID inválido
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'INVALID_ID';
          message = 'The provided ID is invalid';
          break;
        case 'P2000':
          // Valor muito longo
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'VALUE_TOO_LONG';
          message = 'The provided value is too long';
          details = {
            column: prismaError.meta?.column_name,
          };
          break;
        default:
          // Outros erros do Prisma
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'DATABASE_ERROR';
          message = 'A database error occurred';
      }

      this.logger.warn({
        msg: 'Prisma client error',
        error: {
          code: prismaError.code,
          message: prismaError.message,
          meta: prismaError.meta,
        },
        method: request.method,
        url: request.url,
        ip: request.ip,
      });
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // Tratar erros de validação do Prisma
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = 'Invalid data provided to database';

      this.logger.warn({
        msg: 'Prisma validation error',
        error: {
          message: exception.message,
        },
        method: request.method,
        url: request.url,
        ip: request.ip,
      });
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;

      // Logar erros inesperados com stack trace completo
      this.logger.error({
        msg: 'Unexpected error occurred',
        error: {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        },
        method: request.method,
        url: request.url,
        ip: request.ip,
        body: request.body as unknown,
      });
    } else {
      // Logar erros completamente desconhecidos
      this.logger.error({
        msg: 'Unknown error occurred',
        error: String(exception),
        method: request.method,
        url: request.url,
        ip: request.ip,
      });
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details !== undefined && { details }),
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
