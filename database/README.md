# Base de datos

## Conexión desde NestJS

El módulo `apps/backend/src/database` administra un pool mysql2 de hasta cinco conexiones. Lee DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD del archivo local `apps/backend/.env`. No sincroniza ni crea tablas al arrancar.

`GET /api/health/database` devuelve 200 si MySQL permite consultar y 503 si la conexión falla. No devuelve credenciales ni detalles SQL. `GET /api/health` conserva la comprobación independiente de la API.

## Aplicar las migraciones en orden

1. Conectar Workbench a MySQL Community Server con una cuenta administradora.
2. Abrir `database/migrations/001_identity.sql` y revisar el esquema.
3. Ejecutar el archivo una sola vez sobre la base de desarrollo `del_sol_dev`.
4. Aplicar una sola vez `002_sessions.sql` y después `003_original_identity.sql`. La 003 corrige la identidad para respetar el modelo original de 2026, conservando los datos anteriores en tablas archivadas.
5. Verificar las entidades vigentes Usuario, Empleado y Rol, y las tablas técnicas usuario_seguridad y sesiones.

El usuario de la aplicación conserva únicamente SELECT, INSERT, UPDATE y DELETE sobre esta base. No necesita privilegios DDL. No ejecutar migraciones con credenciales de producción ni guardarlas en el repositorio.

MySQL realiza commits implícitos para DDL. El script no es una transacción atómica: ante un fallo parcial revisar las tablas existentes antes de continuar. No se utiliza IF NOT EXISTS para ocultar diferencias de esquema.

## Sesiones de autenticación

La migración 002 introduce sesiones; la 003 conserva sus registros y ajusta la clave foránea a Usuario.Id. No guarda identificadores de sesión en claro: almacena su hash y las marcas de tiempo para controlar inactividad y duración absoluta.

El módulo de autenticación usa los permisos de datos del usuario existente. Consultar `docs/LOGIN.md` para crear el primer administrador y ejecutar las pruebas. La comprobación `/api/health/database` verifica conexión, pero no sustituye la aplicación de migraciones.

## Identidad y asignaciones

El modelo vigente define un único rol mediante Usuario.Id_Rol y una referencia a Empleado mediante Usuario.Id_empleado. Las asignaciones de varios roles y locales creadas inicialmente quedan archivadas y no se utilizan. Ver [correspondencia con el original](../docs/MODELO-ORIGINAL.md).

El estado activo y las fechas se guardan en usuario_seguridad para no agregar columnas al modelo de negocio. La contraseña se almacena como hash en Usuario.Contraseña, con capacidad ampliada a 255 caracteres. El login está implementado; los permisos detallados de los módulos comerciales están pendientes.

Las migraciones conservan el historial. La elección de ORM y la automatización del registro de migraciones siguen pendientes; futuras herramientas deben respetar el modelo original y la migración correctiva 003.
