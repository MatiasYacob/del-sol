# Del Sol

Sistema de gestión para los tres locales de Distribuidora Del Sol, basado en el proyecto de Taller de Integración 2026.

## Estado

Frontend React y API NestJS con login, sesiones MySQL y menú lateral. Las funcionalidades comerciales todavía no están implementadas.

MySQL es obligatorio. NestJS y React con TypeScript están instalados; el ORM está pendiente de selección. Las versiones exactas están fijadas en los package.json y package-lock.json.

## Desarrollo local

Requiere Node.js 24.13.1 o superior dentro de la rama 24 y npm. Desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

- Frontend: http://127.0.0.1:5173
- Salud de la API: http://127.0.0.1:3000/api/health
- Conexión MySQL: http://127.0.0.1:3000/api/health/database
- Documentación Swagger: http://127.0.0.1:3000/api/docs

La configuración de Swagger está en `apps/backend/src/config/swagger.config.ts`.
El archivo `main.ts` la activa mediante `setupSwagger(app)` después de definir el prefijo de la API.

Detener con Ctrl+C. Para verificar tipos y compilar:

```sh
npm run typecheck
npm run build
```

La ruta de salud solo comprueba que la API responde; no comprueba conexión con MySQL.

## MySQL

Se verificó la conexión a `del_sol_dev` en MySQL Community Server 8.0.45. La instalación de XAMPP corresponde a MariaDB y no es la base elegida para este proyecto.

El módulo DatabaseModule administra conexiones mediante mysql2. Las migraciones incluyen usuarios, roles, locales y sesiones. Aplicarlas en orden con una cuenta administradora en Workbench. Consultar [configuración y migraciones](database/README.md) y [alta del administrador](docs/LOGIN.md). El ORM continúa pendiente de selección.

Copiar `apps/backend/.env.example` a `apps/backend/.env` y completar las credenciales locales antes de iniciar la API. Nunca subir ese archivo ni contraseñas al repositorio. La API utiliza estas variables para acceder a MySQL.

## Documentación

- [Preparación del proyecto](docs/PREPARACION.md)
- [Estado y próximos pasos](docs/ESTADO.md)
- [Login y alta del primer administrador](docs/LOGIN.md)
- [Política de sesiones](docs/SEGURIDAD.md)
- [Correspondencia con el modelo original de 2026](docs/MODELO-ORIGINAL.md)

## Trabajo con Git

La rama principal es `main`. Trabajar en ramas por tarea e integrar mediante pull requests. Versionar documentación y migraciones junto con los cambios de aplicación.

No subir secretos, datos reales de clientes ni backups de producción. Los documentos académicos originales se conservan fuera de este repositorio.
