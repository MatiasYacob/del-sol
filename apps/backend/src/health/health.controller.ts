// #==========# IMPORTACIONES #==========#
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service.js';
import { Public } from '../auth/auth.guard.js';

// #==========# ESTADO DE LA API Y MYSQL #==========#
@ApiTags('Estado')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Comprobar que la API responde' })
  @ApiOkResponse({ description: 'La API está funcionando. No verifica MySQL.' })
  health() {
    return { status: 'ok', service: 'del-sol-api' };
  }

  @Get('database')
  @ApiOperation({ summary: 'Comprobar la conexión a MySQL' })
  @ApiOkResponse({ description: 'La base configurada acepta consultas. No verifica las tablas.' })
  @ApiServiceUnavailableResponse({ description: 'No se pudo consultar MySQL.' })
  async databaseHealth() {
    try {
      await this.database.checkConnection();
      return { status: 'ok', database: 'mysql' };
    } catch {
      // No devolver errores SQL ni detalles de conexión al navegador.
      throw new ServiceUnavailableException('La base de datos no está disponible.');
    }
  }
}
