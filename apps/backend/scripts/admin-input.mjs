// #==========# VALIDACIÓN DEL ALTA LOCAL #==========#
// Devuelve mensajes seguros: nunca incorpora los valores de la contraseña.
export function validateAdminInput(name, username, password, confirmation) {
  if (!name || name.length > 50) return 'Ingresá un nombre de entre 1 y 50 caracteres.';
  if (!username || username.length > 50) return 'Ingresá un usuario de entre 1 y 50 caracteres.';
  if (password.length < 12) return 'La contraseña debe tener al menos 12 caracteres.';
  if (password.length > 256) return 'La contraseña no puede superar los 256 caracteres.';
  if (password !== confirmation) return 'Las contraseñas no coinciden. Volvé a ingresarlas.';
  return null;
}
