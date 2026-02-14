import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        // Request ID generation
        genReqId: (req, res) => {
          const existingId = req.id ?? req.headers['x-request-id'];
          if (existingId) return existingId;
          const id = randomUUID();
          res.setHeader('X-Request-Id', id);
          return id;
        },

        // Custom log level
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',

        // Transport for pretty printing in development
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: false,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  messageFormat: '{req.method} {req.url} - {msg}',
                },
              }
            : undefined,

        // Custom serializers
        serializers: {
          req(req: IncomingMessage & { id?: string }) {
            const request = req as Request;
            return {
              id: request.id,
              method: request.method,
              url: request.url,
              query: request.query,
              params: request.params,
              headers: {
                host: request.headers.host,
                'user-agent': request.headers['user-agent'],
                'content-type': request.headers['content-type'],
              },
              remoteAddress: request.socket?.remoteAddress,
              remotePort: request.socket?.remotePort,
            };
          },
          res(res: ServerResponse) {
            return {
              statusCode: res.statusCode,
              headers:
                typeof res.getHeader === 'function'
                  ? {
                      'content-type': res.getHeader('content-type'),
                      'content-length': res.getHeader('content-length'),
                    }
                  : undefined,
            };
          },
          err(err: Error) {
            return {
              type: err.constructor.name,
              ...err,
            };
          },
        },

        // Custom log message
        customLogLevel: function (req: IncomingMessage, res: ServerResponse, err?: Error) {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          } else if (res.statusCode >= 500 || err) {
            return 'error';
          } else if (res.statusCode >= 300 && res.statusCode < 400) {
            return 'silent';
          }
          return 'info';
        },

        // Auto logging
        autoLogging: {
          ignore: (req: IncomingMessage) => {
            // Ignore health check and metrics endpoints
            return (
              req.url === '/health' ||
              req.url === '/api/v1/health' ||
              req.url === '/metrics' ||
              req.url === '/api/v1/metrics'
            );
          },
        },

        // Custom success message with response time
        customSuccessMessage: function (req: IncomingMessage, res: ServerResponse) {
          if (res.statusCode === 404) {
            return `Resource not found`;
          }
          return `${req.method} ${req.url} completed`;
        },

        // Custom error message
        customErrorMessage: function (req: IncomingMessage, res: ServerResponse, err: Error) {
          return `${req.method} ${req.url} failed with error: ${err.message}`;
        },

        // Custom attribute keys for better readability in JSON
        customAttributeKeys: {
          req: 'request',
          res: 'response',
          err: 'error',
          responseTime: 'duration',
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
