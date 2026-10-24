// #==========# CONTROL DE ACCESO Y CSRF #==========#
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { parse } from 'cookie';
import type { Request } from 'express';
import { AuthService, type AuthSession } from './auth.service.js';
import { COOKIE_NAME } from './session-policy.js';

export const Public = () => SetMetadata('public', true);
export type AuthRequest = Request & { auth: AuthSession };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const session = await this.auth.findSession(parse(request.headers.cookie ?? '')[COOKIE_NAME]);
    if (!session) throw new UnauthorizedException('La sesión venció o no está iniciada.');
    request.auth = session;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      if (request.headers.origin !== this.config.get('FRONTEND_ORIGIN', 'http://localhost:5173') || request.headers['x-csrf-token'] !== session.csrfToken) {
        throw new ForbiddenException('Solicitud no autorizada.');
      }
    }
    return true;
  }
}
