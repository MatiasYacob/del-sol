// #==========# IMPORTACIONES #==========#
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';

// #==========# MÓDULO PRINCIPAL #==========#
// Carga las variables locales antes de inicializar la conexión y los módulos.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
