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
      'SELECT CAST(id AS CHAR) AS id, password_hash, activo FROM usuarios WHERE nombre_usuario = ? LIMIT 1', [username],
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
      `SELECT s.*, CAST(u.id AS CHAR) AS user_id, u.nombre, u.nombre_usuario, u.activo
       FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token_hash = ?`, [tokenHash],
    );
    const row = rows[0];
    if (!row) return null;
    if (!row.activo || sessionExpired(Number(row.creada_en_ms), Number(row.actividad_en_ms), Date.now())) {
      await this.removeSession(tokenHash);
      return null;
    }
    const [roles] = await this.db.pool.execute<RowDataPacket[]>(
      'SELECT r.codigo FROM roles r JOIN usuario_roles ur ON ur.rol_id = r.id WHERE ur.usuario_id = ?', [row.user_id],
    );
    const [locales] = await this.db.pool.execute<RowDataPacket[]>(
      'SELECT CAST(l.id AS CHAR) AS id, l.nombre FROM locales l JOIN usuario_locales ul ON ul.local_id = l.id WHERE ul.usuario_id = ? AND l.activo = 1', [row.user_id],
    );
    return {
      tokenHash, csrfToken: row.csrf_token, created: Number(row.creada_en_ms), activity: Number(row.actividad_en_ms),
      user: { id: row.user_id, name: row.nombre, username: row.nombre_usuario, roles: roles.map(r => r.codigo), locales: locales.map(l => ({ id: l.id, nombre: l.nombre })) },
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
