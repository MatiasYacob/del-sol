// #==========# ALTA LOCAL DEL PRIMER ADMINISTRADOR #==========#
// Ejecutar: npm run create-admin -w @del-sol/backend
import { loadEnvFile } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import * as argon2 from 'argon2';
import { validateAdminInput } from './admin-input.mjs';

loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const input = createInterface({ input: process.stdin, output, terminal: true });
let connection;
let validationMessage;
try {
  const name = (await input.question('Nombre completo: ')).trim();
  const username = (await input.question('Usuario: ')).trim();
  process.stdout.write('Contraseña (mínimo 12 caracteres, no se muestra): ');
  muted = true;
  const password = await input.question('');
  muted = false;
  process.stdout.write('\nRepetir contraseña: ');
  muted = true;
  const confirmation = await input.question('');
  muted = false;
  process.stdout.write('\n');
  validationMessage = validateAdminInput(name, username, password, confirmation);
  if (validationMessage) throw new Error('INVALID_INPUT');
  connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await connection.beginTransaction();
  const [roles] = await connection.execute('SELECT id FROM roles WHERE codigo = ?', ['administrador_sistema']);
  if (!roles.length) throw Object.assign(new Error('MISSING_ROLE'), { code: 'MISSING_ROLE' });
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const [result] = await connection.execute('INSERT INTO usuarios (nombre, nombre_usuario, password_hash) VALUES (?, ?, ?)', [name, username, hash]);
  await connection.execute('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)', [result.insertId, roles[0].id]);
  await connection.commit();
  console.log('Administrador creado. No se asignaron locales automáticamente.');
} catch (error) {
  await connection?.rollback().catch(() => {});
  const messages = {
    ER_DUP_ENTRY: 'El usuario ya existe. No fue modificado.',
    ER_ACCESS_DENIED_ERROR: 'MySQL rechazó las credenciales. Revisá DB_USER y DB_PASSWORD en el .env.',
    ER_DBACCESS_DENIED_ERROR: 'El usuario de MySQL no tiene acceso a la base configurada.',
    ER_NO_SUCH_TABLE: 'Faltan tablas. Ejecutá la migración 001 en la base configurada.',
    ER_BAD_DB_ERROR: 'La base configurada no existe. Revisá DB_NAME en el .env.',
    ECONNREFUSED: 'No se pudo conectar a MySQL. Revisá el servicio, host y puerto.',
    ETIMEDOUT: 'MySQL no respondió a tiempo. Revisá el servicio, host y puerto.',
    MISSING_ROLE: 'Falta el rol administrador_sistema. Revisá los datos iniciales de la migración 001.',
  };
  console.error(validationMessage ?? messages[error.code] ?? 'No se pudo crear el administrador por un error interno. No se guardó la cuenta.');
  process.exitCode = 1;
} finally { muted = false; input.close(); await connection?.end(); }
