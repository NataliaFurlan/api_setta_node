import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  @Get() health() {
    return {
      status: 'ok',
      service: 'setta-api',
      timestamp: new Date().toISOString(),
    };
  }
}
