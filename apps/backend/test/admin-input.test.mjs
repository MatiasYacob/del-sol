import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdminInput } from '../scripts/admin-input.mjs';

test('alta local: explica longitud y confirmación sin revelar contraseñas', () => {
  assert.match(validateAdminInput('Nombre', 'usuario', 'corta', 'corta'), /al menos 12/);
  assert.match(validateAdminInput('Nombre', 'usuario', 'a'.repeat(257), 'a'.repeat(257)), /256/);
  assert.match(validateAdminInput('Nombre', 'usuario', 'abcdefghijkl', 'abcdefghijklX'), /no coinciden/);
  assert.match(validateAdminInput('', 'usuario', 'abcdefghijkl', 'abcdefghijkl'), /nombre/);
  assert.match(validateAdminInput('Nombre', '', 'abcdefghijkl', 'abcdefghijkl'), /usuario/);
  assert.equal(validateAdminInput('Nombre', 'usuario', 'abcdefghijkl', 'abcdefghijkl'), null);
});
