// #==========# PRUEBA DE LOGIN EN LA BASE LOCAL #==========#
// Crea un usuario temporal y elimina solo sus sesiones, roles y cuenta al final.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEnvFile } from 'node:process';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import * as argon2 from 'argon2';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { setupSwagger } from '../dist/config/swagger.config.js';
import { IDLE_MS, ABSOLUTE_MS, sessionExpired } from '../dist/auth/session-policy.js';

loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));

test('límites exactos: cinco horas inactivo y seis horas absolutas', () => {
  const start = 1000;
  assert.equal(sessionExpired(start, start, start + IDLE_MS - 1), false);
  assert.equal(sessionExpired(start, start, start + IDLE_MS), true);
  assert.equal(sessionExpired(start, start + IDLE_MS, start + ABSOLUTE_MS - 1), false);
  assert.equal(sessionExpired(start, start + IDLE_MS, start + ABSOLUTE_MS), true);
});

test('login, cookie, CSRF, actividad, expiración, revocación y límite de intentos', { timeout: 60000 }, async () => {
  const db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  let app;
  let userId;
  const username = `test_${randomBytes(8).toString('hex')}`;
  const password = randomBytes(24).toString('hex');
  try {
    await db.query('SELECT token_hash FROM sesiones LIMIT 0');
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const [result] = await db.execute('INSERT INTO usuarios (nombre, nombre_usuario, password_hash) VALUES (?, ?, ?)', ['Prueba temporal de login', username, hash]);
    userId = result.insertId;
    await db.execute('INSERT INTO usuario_roles (usuario_id, rol_id) SELECT ?, id FROM roles WHERE codigo = ?', [userId, 'administrador_sistema']);
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    setupSwagger(app);
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const origin = process.env.FRONTEND_ORIGIN;
    const call = (path, options = {}) => fetch(`${url}/api${path}`, options);
    const login = (pwd = password) => call('/auth/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: pwd }) });

    assert.equal((await call('/auth/me')).status, 401);
    const bad = await login('incorrecta'); assert.equal(bad.status, 401);
    const denied = await call('/auth/login', { method: 'POST', headers: { Origin: 'http://untrusted.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    assert.equal(denied.status, 403);
    const response = await login(); assert.equal(response.status, 200);
    const setCookie = response.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=Strict/i);
    assert.match(setCookie, /Max-Age=21600/i);
    const cookie = setCookie.split(';')[0];
    const session = await response.json();
    assert.equal(session.user.username, username);
    assert.ok(session.user.roles.includes('administrador_sistema'));
    assert.equal('password_hash' in session.user, false);
    const digest = createHash('sha256').update(cookie.split('=')[1]).digest('hex');
    const headers = { Cookie: cookie, Origin: origin, 'X-CSRF-Token': session.csrfToken };
    assert.equal((await call('/auth/me', { headers })).status, 200);
    assert.equal((await call('/auth/logout', { method: 'POST', headers: { Cookie: cookie, Origin: origin } })).status, 403);
    await db.execute('UPDATE sesiones SET actividad_en_ms = ? WHERE token_hash = ?', [Date.now() - 60000, digest]);
    const [before] = await db.execute('SELECT actividad_en_ms FROM sesiones WHERE token_hash = ?', [digest]);
    await call('/auth/me', { headers });
    const [after] = await db.execute('SELECT actividad_en_ms FROM sesiones WHERE token_hash = ?', [digest]);
    assert.equal(Number(before[0].actividad_en_ms), Number(after[0].actividad_en_ms));
    assert.equal((await call('/auth/activity', { method: 'POST', headers })).status, 204);
    const [touched] = await db.execute('SELECT actividad_en_ms, creada_en_ms FROM sesiones WHERE token_hash = ?', [digest]);
    assert.ok(Number(touched[0].actividad_en_ms) > Number(before[0].actividad_en_ms));
    assert.equal(Number(touched[0].creada_en_ms), session.createdAt);
    assert.equal((await call('/auth/logout', { method: 'POST', headers })).status, 204);
    assert.equal((await call('/auth/me', { headers })).status, 401);

    for (const mode of ['idle', 'absolute']) {
      const res = await login(); assert.equal(res.status, 200);
      const ck = res.headers.get('set-cookie').split(';')[0];
      const dig = createHash('sha256').update(ck.split('=')[1]).digest('hex');
      const now = Date.now();
      await db.execute('UPDATE sesiones SET creada_en_ms = ?, actividad_en_ms = ? WHERE token_hash = ?', [now - (mode === 'idle' ? IDLE_MS : ABSOLUTE_MS) - 1000, mode === 'idle' ? now - IDLE_MS - 1000 : now, dig]);
      assert.equal((await call('/auth/me', { headers: { Cookie: ck } })).status, 401);
    }
    // Cinco solicitudes al login ya consumidas (incluida la de origen inválido).
    assert.equal((await login()).status, 429);
    const revokedToken = randomBytes(32).toString('hex');
    await db.execute('INSERT INTO sesiones (token_hash, usuario_id, csrf_token, creada_en_ms, actividad_en_ms) VALUES (?, ?, ?, ?, ?)', [createHash('sha256').update(revokedToken).digest('hex'), userId, randomBytes(32).toString('hex'), Date.now(), Date.now()]);
    await db.execute('UPDATE usuarios SET activo = 0 WHERE id = ?', [userId]);
    assert.equal((await call('/auth/me', { headers: { Cookie: `del_sol_session=${revokedToken}` } })).status, 401);
    await assert.rejects(app.get(AuthService).login(username, password), error => error.getStatus?.() === 401);
    const spec = await (await fetch(`${url}/api/docs-json`)).json();
    assert.ok(spec.paths['/api/auth/login']); assert.ok(spec.paths['/api/auth/logout']);
  } finally {
    await app?.close();
    if (userId) {
      await db.execute('DELETE FROM sesiones WHERE usuario_id = ?', [userId]);
      await db.execute('DELETE FROM usuario_roles WHERE usuario_id = ?', [userId]);
      await db.execute('DELETE FROM usuarios WHERE id = ?', [userId]);
    }
    await db.end();
  }
});
