// #==========# ENDPOINTS DEL LOGIN #==========#
import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { Public, type AuthRequest } from './auth.guard.js';
import { ABSOLUTE_MS, COOKIE_NAME } from './session-policy.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión con usuario y contraseña' })
  @ApiBody({ schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string', format: 'password' } } } })
  async login(@Body() body: unknown, @Headers('origin') origin: string | undefined, @Res({ passthrough: true }) response: Response) {
    if (origin !== this.config.get('FRONTEND_ORIGIN', 'http://localhost:5173')) throw new ForbiddenException('Origen no autorizado.');
    const value = body as Record<string, unknown> | null;
    if (!value || typeof value.username !== 'string' || typeof value.password !== 'string' || !value.username.trim() || value.username.length > 100 || !value.password || value.password.length > 256) {
      throw new BadRequestException('Ingresá un usuario y una contraseña válidos.');
    }
    const token = await this.auth.login(value.username.trim(), value.password);
    const session = await this.auth.findSession(token);
    response.setHeader('Cache-Control', 'no-store');
    response.cookie(COOKIE_NAME, token, { httpOnly: true, secure: this.config.get('NODE_ENV') === 'production', sameSite: 'strict', path: '/api', maxAge: ABSOLUTE_MS });
    return this.payload(session!);
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar la sesión sin renovar su actividad' })
  me(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    return this.payload(request.auth);
  }

  @Post('activity')
  @HttpCode(204)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Registrar interacción del usuario sin extender el máximo de seis horas' })
  @ApiHeader({ name: 'X-CSRF-Token', required: true, description: 'Token devuelto por login o /auth/me.' })
  async activity(@Req() request: AuthRequest) { await this.auth.touch(request.auth); }

  @Post('logout')
  @HttpCode(204)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Invalidar la sesión actual' })
  @ApiHeader({ name: 'X-CSRF-Token', required: true, description: 'Token devuelto por login o /auth/me.' })
  async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
    await this.auth.removeSession(request.auth.tokenHash);
    response.clearCookie(COOKIE_NAME, { path: '/api', httpOnly: true, sameSite: 'strict', secure: this.config.get('NODE_ENV') === 'production' });
  }

  private payload(session: import('./auth.service.js').AuthSession) {
    return { user: session.user, csrfToken: session.csrfToken, createdAt: session.created, lastActivityAt: session.activity };
  }
}
