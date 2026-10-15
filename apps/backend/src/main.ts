// #==========# IMPORTACIONES #==========#
// Habilita los metadatos que NestJS utiliza para resolver dependencias.
import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config.js';

// #==========# ESTADO DE LA API #==========#
// GET /api/health confirma que el servidor responde; no verifica MySQL.
@Controller('health')
class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'del-sol-api',
    };
  }
}

// #==========# MÓDULO PRINCIPAL #==========#
// Carga el archivo .env del backend y permite consultar sus variables.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
})
class AppModule {}

// #==========# CONFIGURACIÓN DEL SERVIDOR #==========#
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Autoriza al frontend configurado a realizar solicitudes desde el navegador.
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173'),
  });

  // Todas las rutas de los controladores comienzan con /api.
  app.setGlobalPrefix('api');

  // #==========# DOCUMENTACIÓN SWAGGER #==========#
  setupSwagger(app);

  // #==========# ESCUCHA LOCAL #==========#
  // El servidor de desarrollo acepta conexiones únicamente desde este equipo.
  await app.listen(Number(config.get('PORT', 3000)), '127.0.0.1');
}

// #==========# INICIO DE LA APLICACIÓN #==========#
void bootstrap();
