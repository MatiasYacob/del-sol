-- #==========# BASE DE DESARROLLO #==========#
-- Ejecutar en MySQL Workbench con una cuenta administradora local.
-- No elimina ni modifica tablas existentes.
CREATE DATABASE IF NOT EXISTS del_sol_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- #==========# COMPROBACIÓN #==========#
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'del_sol_dev';

-- #==========# USUARIO DE LA APLICACIÓN #==========#
-- Crear del_sol_dev desde Workbench > Administration > Users and Privileges.
-- Elegir una contraseña local y limitar el acceso a localhost.
-- Conceder SELECT, INSERT, UPDATE y DELETE únicamente sobre del_sol_dev.*.
-- Las migraciones se ejecutarán con una cuenta separada con permisos de DDL.
-- Guardar la contraseña solo en apps/backend/.env (ignorado por Git).
