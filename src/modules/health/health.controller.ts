import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação saudável',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2026-02-15T20:30:00.000Z',
        uptime: 3600,
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não saudável',
  })
  async checkHealth() {
    const healthCheck = await this.healthService.checkHealth();

    // Se unhealthy, retornar 503 Service Unavailable
    if (healthCheck.status === 'unhealthy') {
      throw new HttpException(
        {
          error: 'Service Unavailable',
          message: 'Application is unhealthy',
          details: healthCheck,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return healthCheck;
  }
}
