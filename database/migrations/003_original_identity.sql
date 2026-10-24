-- #==========# MODELO ORIGINAL 2026: USUARIO, EMPLEADO Y ROL #==========#
-- Detener npm run dev antes de ejecutar en Workbench como administrador.
-- Ejecutar una sola vez. Las tablas anteriores quedan archivadas, no se borran.
-- DDL no es transaccional: ante un fallo, no repetir sin revisar el estado.
USE del_sol_dev;

DELIMITER $$
CREATE PROCEDURE migrar_identidad_003()
BEGIN
  -- #==========# VALIDACIONES SIN TRUNCAR NI ELEGIR ROLES #==========#
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE()
             AND table_name IN ('usuario','empleado','rol','usuario_seguridad','legacy_usuarios_003')) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Migración ya iniciada o tablas destino existentes. Revisar antes de continuar.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuarios WHERE id > 2147483647 OR CHAR_LENGTH(nombre_usuario)>50 OR CHAR_LENGTH(nombre)>50) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Hay usuarios incompatibles con INT o CHAR(50). No se migró.';
  END IF;
  IF EXISTS (SELECT 1 FROM roles WHERE id > 2147483647 OR CHAR_LENGTH(nombre)>50) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Hay roles incompatibles con el modelo original.';
  END IF;
  IF EXISTS (SELECT u.id FROM usuarios u LEFT JOIN usuario_roles ur ON ur.usuario_id=u.id
             GROUP BY u.id HAVING COUNT(ur.rol_id)<>1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cada usuario debe tener exactamente un rol antes de migrar.';
  END IF;

  -- #==========# ENTIDADES DEL DIAGRAMA #==========#
  CREATE TABLE Rol (
    Id INT NOT NULL AUTO_INCREMENT,
    `Descripción` CHAR(50) NOT NULL,
    PRIMARY KEY (Id)
  ) ENGINE=InnoDB;

  CREATE TABLE Empleado (
    Id INT NOT NULL AUTO_INCREMENT,
    Nombre CHAR(50) NOT NULL,
    Apellido CHAR(50) NOT NULL,
    Num_Documento INT(11) NULL,
    `Teléfono` CHAR(50) NULL,
    PRIMARY KEY (Id)
  ) ENGINE=InnoDB;

  CREATE TABLE Usuario (
    Id INT NOT NULL AUTO_INCREMENT,
    Nombre CHAR(50) NOT NULL,
    -- Ajuste técnico documentado: CHAR(50) no alcanza para un hash Argon2id.
    `Contraseña` VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    Id_empleado INT NULL,
    Id_Rol INT NULL,
    PRIMARY KEY (Id),
    UNIQUE KEY uq_usuario_nombre (Nombre),
    CONSTRAINT fk_usuario_empleado FOREIGN KEY (Id_empleado) REFERENCES Empleado (Id),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (Id_Rol) REFERENCES Rol (Id)
  ) ENGINE=InnoDB;

  -- #==========# METADATOS TÉCNICOS FUERA DEL MODELO DE NEGOCIO #==========#
  CREATE TABLE usuario_seguridad (
    usuario_id INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id),
    CONSTRAINT chk_usuario_seguridad_activo CHECK (activo IN (0,1)),
    CONSTRAINT fk_usuario_seguridad FOREIGN KEY (usuario_id) REFERENCES Usuario (Id)
  ) ENGINE=InnoDB;

  CREATE TABLE sesiones_modelo_003 (
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    usuario_id INT NOT NULL,
    csrf_token CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    creada_en_ms BIGINT UNSIGNED NOT NULL,
    actividad_en_ms BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (token_hash),
    KEY idx_sesiones_usuario (usuario_id),
    KEY idx_sesiones_creada (creada_en_ms),
    KEY idx_sesiones_actividad (actividad_en_ms),
    CONSTRAINT fk_sesiones_modelo_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario (Id)
  ) ENGINE=InnoDB;

  -- #==========# CONSERVACIÓN DE IDENTIDAD Y ACCESO #==========#
  INSERT INTO Rol (Id, `Descripción`) SELECT id, nombre FROM roles;
  INSERT INTO Empleado (Id, Nombre, Apellido)
    SELECT id, nombre, '' FROM usuarios;
  INSERT INTO Usuario (Id, Nombre, `Contraseña`, Id_empleado, Id_Rol)
    SELECT u.id, u.nombre_usuario, u.password_hash, u.id, ur.rol_id
    FROM usuarios u JOIN usuario_roles ur ON ur.usuario_id=u.id;
  INSERT INTO usuario_seguridad (usuario_id, activo, creado_en, actualizado_en)
    SELECT id, activo, creado_en, actualizado_en FROM usuarios;
  INSERT INTO sesiones_modelo_003
    SELECT token_hash, usuario_id, csrf_token, creada_en_ms, actividad_en_ms FROM sesiones;

  -- El cambio de nombres se realiza en una única sentencia.
  RENAME TABLE sesiones TO legacy_sesiones_003,
    sesiones_modelo_003 TO sesiones,
    usuario_roles TO legacy_usuario_roles_003,
    usuario_locales TO legacy_usuario_locales_003,
    usuarios TO legacy_usuarios_003,
    roles TO legacy_roles_003,
    locales TO legacy_locales_003;
END$$
DELIMITER ;

CALL migrar_identidad_003();
DROP PROCEDURE migrar_identidad_003;

-- #==========# VERIFICACIÓN SIN EXPONER CONTRASEÑAS #==========#
SELECT u.Id, u.Nombre AS Usuario, e.Nombre AS Empleado,
       e.Apellido, r.`Descripción` AS Rol
FROM Usuario u
LEFT JOIN Empleado e ON e.Id=u.Id_empleado
LEFT JOIN Rol r ON r.Id=u.Id_Rol;
