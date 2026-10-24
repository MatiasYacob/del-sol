-- #==========# SESIONES DEL LOGIN #==========#
-- Ejecutar una sola vez en Workbench con una cuenta administradora.
USE del_sol_dev;
CREATE TABLE sesiones (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  csrf_token CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  creada_en_ms BIGINT UNSIGNED NOT NULL,
  actividad_en_ms BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_sesiones_usuario (usuario_id),
  KEY idx_sesiones_creada (creada_en_ms),
  KEY idx_sesiones_actividad (actividad_en_ms),
  CONSTRAINT fk_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB;
