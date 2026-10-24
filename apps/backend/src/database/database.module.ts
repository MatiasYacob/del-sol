// #==========# MÓDULO DE ACCESO A MYSQL #==========#
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

// Los módulos que necesiten datos deben importar este módulo explícitamente.
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
