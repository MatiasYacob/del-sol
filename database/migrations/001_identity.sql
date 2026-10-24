-- #==========# MIGRACIÓN 001: USUARIOS, ROLES Y LOCALES #==========#
-- Ejecutar con una cuenta administradora en Workbench sobre MySQL 8.
-- No contiene DROP ni ALTER de tablas existentes. No repetir si ya se aplicó.
-- MySQL confirma cada DDL por separado: si falla, revisar antes de reintentar.
USE del_sol_dev;

CREATE TABLE roles (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE locales (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_locales_codigo (codigo),
  CONSTRAINT chk_locales_activo CHECK (activo IN (0, 1))
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  -- Solo almacenar un hash generado por el futuro módulo de autenticación.
  password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_nombre_usuario (nombre_usuario),
  CONSTRAINT chk_usuarios_activo CHECK (activo IN (0, 1))
) ENGINE=InnoDB;

-- #==========# ASIGNACIONES SIN DUPLICADOS #==========#
-- Roles globales del usuario; el alcance por local se definirá en autorización.
CREATE TABLE usuario_roles (
  usuario_id BIGINT UNSIGNED NOT NULL,
  rol_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  CONSTRAINT fk_usuario_roles_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB;

CREATE TABLE usuario_locales (
  usuario_id BIGINT UNSIGNED NOT NULL,
  local_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, local_id),
  CONSTRAINT fk_usuario_locales_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  CONSTRAINT fk_usuario_locales_local FOREIGN KEY (local_id) REFERENCES locales (id)
) ENGINE=InnoDB;

-- #==========# ROLES DEL INFORME 2026 #==========#
INSERT INTO roles (codigo, nombre) VALUES
  ('administrador_sistema', 'Administrador del sistema'),
  ('administrativo_general', 'Administrativo general'),
  ('administrativo_ventas', 'Administrativo de ventas');

-- No se crean usuarios ni locales ficticios automáticamente.
SHOW TABLES;
