# Base de datos

## Conexión desde NestJS

El módulo `apps/backend/src/database` administra un pool mysql2 de hasta cinco conexiones. Lee DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD del archivo local `apps/backend/.env`. No sincroniza ni crea tablas al arrancar.

`GET /api/health/database` devuelve 200 si MySQL permite consultar y 503 si la conexión falla. No devuelve credenciales ni detalles SQL. `GET /api/health` conserva la comprobación independiente de la API.

## Aplicar la primera migración

1. Conectar Workbench a MySQL Community Server con una cuenta administradora.
2. Abrir `database/migrations/001_identity.sql` y revisar el esquema.
3. Ejecutar el archivo una sola vez sobre la base de desarrollo `del_sol_dev`.
4. Comprobar cinco tablas: roles, locales, usuarios, usuario_roles y usuario_locales; roles contiene las tres filas del informe.

El usuario de la aplicación conserva únicamente SELECT, INSERT, UPDATE y DELETE sobre esta base. No necesita privilegios DDL. No ejecutar migraciones con credenciales de producción ni guardarlas en el repositorio.

MySQL realiza commits implícitos para DDL. El script no es una transacción atómica: ante un fallo parcial revisar las tablas existentes antes de continuar. No se utiliza IF NOT EXISTS para ocultar diferencias de esquema.

## Modelo inicial

## Sesiones de autenticación

Tras aplicar la migración 001, ejecutar una sola vez `migrations/002_sessions.sql` con una cuenta administradora. Esta migración agrega `sesiones` y su relación con `usuarios`. No guarda identificadores de sesión en claro: almacena su hash y las marcas de tiempo para controlar inactividad y duración absoluta.

El módulo de autenticación usa los permisos de datos del usuario existente. Consultar `docs/LOGIN.md` para crear el primer administrador y ejecutar las pruebas. La comprobación `/api/health/database` verifica conexión, pero no sustituye la aplicación de migraciones.

## Identidad y asignaciones

Los usuarios pueden tener varios roles y acceso a varios locales mediante tablas de asignación. Los roles son globales; no representan todavía permisos distintos por local. El login y las reglas de autorización aún no están implementados.

Los locales y usuarios se desactivan conservando su identidad. Las claves foráneas impiden borrar una identidad que tenga asignaciones. La contraseña se almacenará únicamente como hash; no hay usuarios ni contraseñas iniciales.

El script es el primer esquema versionado. La elección de ORM y la automatización del registro de migraciones siguen pendientes; futuras herramientas deben respetar esta versión.
