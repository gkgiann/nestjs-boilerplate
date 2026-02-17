import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
    let databaseResponseTime: number | undefined;

    try {
      // Verificar conexão com o banco executando uma query simples
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
      databaseResponseTime = Date.now() - startTime;
    } catch {
      databaseStatus = 'disconnected';
    }

    const isHealthy = databaseStatus === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: databaseStatus,
        ...(databaseResponseTime !== undefined && { responseTime: databaseResponseTime }),
      },
    };
  }
}
