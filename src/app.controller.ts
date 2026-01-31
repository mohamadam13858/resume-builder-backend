import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check and API info' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is running',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resume Builder API is running' },
        version: { type: 'string', example: '1.0.0' },
        documentation: { type: 'string', example: '/api' },
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
      },
    },
  })
  getHello() {
    return {
      message: 'Resume Builder API is running',
      version: '1.0.0',
      documentation: '/api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}