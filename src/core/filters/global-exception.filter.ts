import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

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

      // Log expected HTTP exceptions as warnings
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
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;

      // Log unexpected errors with full stack trace
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
      // Log completely unknown errors
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
