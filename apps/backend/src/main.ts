// #==========# IMPORTACIONES #==========#
// Habilita los metadatos que NestJS utiliza para resolver dependencias.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { setupSwagger } from './config/swagger.config.js';

// #==========# CONFIGURACIÓN DEL SERVIDOR #==========#
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableShutdownHooks();

  // Autoriza al frontend configurado a realizar solicitudes desde el navegador.
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173'),
    credentials: true,
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
