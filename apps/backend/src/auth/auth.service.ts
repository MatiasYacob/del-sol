// #==========# IMPORTACIONES #==========#
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import { ABSOLUTE_MS, IDLE_MS, sessionExpired } from './session-policy.js';

export interface AuthSession {
  tokenHash: string;
  csrfToken: string;
  created: number;
  activity: number;
  user: { id: string; name: string; username: string; roles: string[]; locales: { id: string; nombre: string }[] };
}

// #==========# CREDENCIALES Y SESIONES EN MYSQL #==========#
@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash = '';
  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    // Ejecutar el mismo algoritmo aunque el usuario no exista.
    this.dummyHash = await argon2.hash(randomBytes(32), { type: argon2.argon2id });
  }

  private digest(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async login(username: string, password: string) {
    const [users] = await this.db.pool.execute<RowDataPacket[]>(
      'SELECT CAST(u.Id AS CHAR) AS id, u.Contraseña AS password_hash, s.activo FROM Usuario u JOIN usuario_seguridad s ON s.usuario_id=u.Id WHERE u.Nombre = ? LIMIT 1', [username],
    );
    const user = users[0];
    const valid = await argon2.verify(user?.password_hash ?? this.dummyHash, password).catch(() => false);
    if (!valid || !user?.activo) throw new UnauthorizedException('Usuario o contraseña incorrectos.');

    const token = randomBytes(32).toString('hex');
    const now = Date.now();
    // Purgar sesiones vencidas al autenticar; no conserva un historial de tokens.
    await this.db.pool.execute('DELETE FROM sesiones WHERE creada_en_ms <= ? OR actividad_en_ms <= ?', [now - ABSOLUTE_MS, now - IDLE_MS]);
    await this.db.pool.execute(
      'INSERT INTO sesiones (token_hash, usuario_id, csrf_token, creada_en_ms, actividad_en_ms) VALUES (?, ?, ?, ?, ?)',
      [this.digest(token), user.id, randomBytes(32).toString('hex'), now, now],
    );
    return token;
  }

  async findSession(token: string | undefined): Promise<AuthSession | null> {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const tokenHash = this.digest(token);
    const [rows] = await this.db.pool.execute<RowDataPacket[]>(
      `SELECT s.*, CAST(u.Id AS CHAR) AS user_id, COALESCE(e.Nombre, u.Nombre) AS nombre, u.Nombre AS nombre_usuario, seg.activo,
              r.\`Descripción\` AS rol_descripcion
       FROM sesiones s JOIN Usuario u ON u.Id=s.usuario_id
       JOIN usuario_seguridad seg ON seg.usuario_id=u.Id
       LEFT JOIN Empleado e ON e.Id=u.Id_empleado
       LEFT JOIN Rol r ON r.Id=u.Id_Rol WHERE s.token_hash = ?`, [tokenHash],
    );
    const row = rows[0];
    if (!row) return null;
    if (!row.activo || sessionExpired(Number(row.creada_en_ms), Number(row.actividad_en_ms), Date.now())) {
      await this.removeSession(tokenHash);
      return null;
    }
    // El modelo original asigna un único rol por usuario.
    const roleCodes: Record<string, string> = {
      'Administrador del sistema': 'administrador_sistema',
      'Administrativo general': 'administrativo_general',
      'Administrativo de ventas': 'administrativo_ventas',
    };
    const code = roleCodes[row.rol_descripcion];
    return {
      tokenHash, csrfToken: row.csrf_token, created: Number(row.creada_en_ms), activity: Number(row.actividad_en_ms),
      user: { id: row.user_id, name: row.nombre, username: row.nombre_usuario, roles: code ? [code] : [], locales: [] },
    };
  }

  async touch(session: AuthSession) {
    // Una consulta automática de /me no cuenta como interacción del usuario.
    await this.db.pool.execute('UPDATE sesiones SET actividad_en_ms = GREATEST(actividad_en_ms, ?) WHERE token_hash = ?', [Date.now(), session.tokenHash]);
  }

  async removeSession(tokenHash: string) {
    await this.db.pool.execute('DELETE FROM sesiones WHERE token_hash = ?', [tokenHash]);
  }
}
