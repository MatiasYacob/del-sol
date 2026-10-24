-- #==========# LIMPIEZA DE TABLAS ARCHIVADAS #==========#
-- Ejecutar una sola vez como administrador después de validar la migración 003.
-- Se guardó una copia local previa en backups/ (excluida de Git).
-- Esta operación elimina las tablas archivadas y sus datos.
-- No desactivar FOREIGN_KEY_CHECKS: si aparece una dependencia, detenerse.
USE del_sol_dev;

-- #==========# ELIMINAR PRIMERO LAS TABLAS DEPENDIENTES #==========#
DROP TABLE legacy_sesiones_003;
DROP TABLE legacy_usuario_locales_003;
DROP TABLE legacy_usuario_roles_003;

-- #==========# ELIMINAR LAS ENTIDADES ANTERIORES #==========#
DROP TABLE legacy_usuarios_003;
DROP TABLE legacy_locales_003;
DROP TABLE legacy_roles_003;

-- #==========# COMPROBAR EL ESQUEMA VIGENTE #==========#
SHOW TABLES;
