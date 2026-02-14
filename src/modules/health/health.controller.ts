import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
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
