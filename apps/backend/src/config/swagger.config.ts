// #==========# IMPORTACIONES #==========#
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// #==========# CONFIGURACIÓN DE SWAGGER #==========#
// Genera la especificación OpenAPI a partir de los controladores registrados.
// Invocar después de configurar el prefijo global para incluirlo en las rutas.
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Del Sol API')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // #==========# PUBLICACIÓN DE LA DOCUMENTACIÓN #==========#
  // Interfaz: /api/docs. Especificación JSON: /api/docs-json.
  SwaggerModule.setup('api/docs', app, document);
}
