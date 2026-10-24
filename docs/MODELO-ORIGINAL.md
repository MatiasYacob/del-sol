# Correspondencia con el modelo original de 2026

La fuente es `TALLER 2026/Diagramas/Diagrama de Base de datos/Diagrama BD.drawio`. Las migraciones 001 y 002 forman parte del historial; la 003 corrige el esquema sin reescribirlas.

## Entidades de negocio

| Entidad | Columnas del modelo que utiliza el sistema |
|---|---|
| Usuario | Id, Nombre, Contraseña, Id_empleado, Id_Rol |
| Empleado | Id, Nombre, Apellido, Num_Documento, Teléfono |
| Rol | Id, Descripción |

Usuario.Nombre es el identificador del login. El nombre y apellido de la persona corresponden a Empleado. Cada Usuario tiene una única referencia Id_Rol y una referencia Id_empleado; ya no se utiliza una relación de varios roles. Los identificadores son INT, como indica el diagrama.

El diagrama no especifica el tipo de Descripción de Rol; se utiliza CHAR(50). Los identificadores tienen autoincremento y Usuario.Nombre es único para evitar ambigüedad al autenticar.

## Ajuste técnico de contraseña

El campo se llama Contraseña como en el modelo, pero utiliza VARCHAR(255) ASCII binario en lugar de CHAR(50), porque el hash Argon2id no cabe en 50 caracteres. No se guardan contraseñas en texto original. Este ajuste fue informado al usuario antes de preparar la migración.

## Tablas técnicas

- `usuario_seguridad`: estado activo y fechas, separados de las columnas del modelo de negocio.
- `sesiones`: identificadores protegidos y tiempos del login. Su clave foránea apunta a Usuario.Id.

La respuesta de la API conserva `roles` como arreglo de cero o un elemento por compatibilidad con el frontend. Esto no representa una relación de varios roles. `locales` se devuelve vacío hasta implementar el modelo correspondiente; no se presupone una asignación de usuarios a locales ausente en el modelo original.

## Migración de los datos existentes

Detener los procesos de desarrollo y ejecutar una sola vez `database/migrations/003_original_identity.sql` en Workbench con una cuenta administradora. El procedimiento comprueba longitudes, identificadores y exactamente un rol por usuario antes de crear tablas. No resuelve automáticamente situaciones ambiguas.

Se conservan Id, nombre de acceso, hash, rol, estado y fechas del administrador, además de sus sesiones. El campo de nombre disponible en el esquema anterior se copia a Empleado.Nombre sin adivinar un apellido. Apellido queda como cadena vacía y documento/teléfono quedan nulos hasta completar el legajo real. No se pierden datos: el registro anterior permanece archivado.

Las tablas anteriores se renombran con el prefijo `legacy_` y el sufijo `_003`, incluidas las asignaciones y locales añadidos previamente. La aplicación deja de utilizarlas. Estos archivos de transición no constituyen el modelo de negocio vigente. No borrar las tablas archivadas hasta validar el acceso y decidir una política de conservación; contienen información sensible, incluidos hashes y sesiones anteriores.

DDL en MySQL no se revierte con ROLLBACK. Si se interrumpe la ejecución, revisar el estado antes de repetir. Una vez aplicada la migración, comprobar preservación y estructura, ejecutar las pruebas de login y reiniciar `npm run dev`.
