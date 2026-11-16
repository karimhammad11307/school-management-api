import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Check API and database connectivity' })
  async check() {
    await this.dataSource.query('SELECT 1');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
