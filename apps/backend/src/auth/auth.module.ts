// #==========# MÓDULO DE AUTENTICACIÓN #==========#
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '../database/database.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

@Module({
  imports: [DatabaseModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }])],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
