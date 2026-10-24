// #==========# IMPORTACIONES #==========#
import { Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import type { Pool, RowDataPacket } from 'mysql2/promise';

// #==========# CONEXIONES COMPARTIDAS #==========#
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly pool: Pool;

  constructor(config: ConfigService) {
    const port = Number(config.get<string>('DB_PORT', '3306'));

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT debe ser un puerto válido.');
    }

    // El pool abre conexiones cuando hacen falta. No crea ni sincroniza tablas.
    this.pool = createPool({
      host: config.getOrThrow<string>('DB_HOST'),
      port,
      database: config.getOrThrow<string>('DB_NAME'),
      user: config.getOrThrow<string>('DB_USER'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      charset: 'utf8mb4',
      connectionLimit: 5,
      connectTimeout: 5000,
      waitForConnections: true,
      queueLimit: 20,
      multipleStatements: false,
    });
  }

  // #==========# COMPROBACIÓN DE DISPONIBILIDAD #==========#
  // Verifica la conexión sin exponer credenciales ni información del servidor.
  async checkConnection(): Promise<void> {
    await this.pool.query<RowDataPacket[]>({ sql: 'SELECT 1', timeout: 5000 });
  }

  // #==========# CIERRE DEL POOL #==========#
  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
