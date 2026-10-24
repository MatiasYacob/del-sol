# Login

## Preparación local

1. Aplicar una sola vez `database/migrations/002_sessions.sql` en Workbench como administrador.
2. Completar `apps/backend/.env` con el usuario de aplicación. Usar `FRONTEND_ORIGIN=http://127.0.0.1:5173`.
3. Desde la raíz ejecutar `npm run create-admin -w @del-sol/backend`. El asistente pide nombre, usuario y contraseña dos veces sin mostrarla. Exige entre 12 y 256 caracteres y no modifica un usuario existente.
4. Ejecutar `npm run dev` y abrir `http://127.0.0.1:5173`. Reiniciar procesos que ya estuvieran ejecutándose para tomar las nuevas variables.

El alta inicial usa una transacción y asigna administrador_sistema. No inventa locales. El usuario podrá iniciar sesión, pero los módulos comerciales y permisos detallados por local todavía no están implementados.

## Seguridad implementada

- Contraseñas Argon2id con salt aleatoria, sin guardar texto original.
- Sesiones opacas con 32 bytes aleatorios. MySQL guarda solamente SHA-256 del identificador y un token CSRF.
- Cookie HttpOnly, SameSite=Strict, Path=/api y vida máxima de seis horas; Secure cuando NODE_ENV=production. Producción requiere HTTPS y frontend/API bajo el mismo sitio.
- Expiración en el servidor tras cinco horas sin actividad o seis horas desde el login. La actividad nunca cambia la fecha inicial.
- `/me` no renueva la actividad. El frontend registra interacción real por teclado, clic o desplazamiento, como máximo una vez por minuto. Una pestaña abandonada no emite actividad periódica.
- El servidor comprueba que el usuario continúe activo y consulta sus roles y locales activos en cada solicitud autenticada.
- Logout elimina la sesión en MySQL. Las sesiones vencidas se rechazan y se limpian al consultar o al iniciar sesión.
- Origen exacto para login y origen más token CSRF para solicitudes autenticadas que modifican estado.
- Cinco intentos por minuto e IP en login. El contador reside en memoria de cada proceso: un despliegue con varias instancias necesita un almacén compartido. Reiniciar el proceso reinicia el contador.
- Guard global: las futuras rutas quedan protegidas salvo que se declaren públicas. Health es público; la interfaz Swagger se sirve como middleware de documentación.
- Sin registro público y sin guardar tokens en localStorage. Los módulos de negocio deben agregar su autorización por rol/local antes de implementarse.

## API

| Ruta | Uso |
|---|---|
| POST /api/auth/login | Usuario y contraseña; crea cookie de sesión y devuelve usuario y token CSRF |
| GET /api/auth/me | Consulta la sesión y sus límites, sin renovar actividad |
| POST /api/auth/activity | Registra interacción, requiere X-CSRF-Token |
| POST /api/auth/logout | Revoca la sesión, requiere X-CSRF-Token |

La documentación OpenAPI incluye las cuatro rutas. Para probar las operaciones desde una interfaz web debe respetarse FRONTEND_ORIGIN. Se puede abrir Swagger por el proxy del frontend en `http://127.0.0.1:5173/api/docs` para compartir origen y cookie. La cookie no se introduce manualmente como contraseña en Swagger.

## Verificación

Con MySQL activo y migraciones aplicadas:

```sh
npm run test:auth -w @del-sol/backend
```

La prueba crea una cuenta con nombre aleatorio, valida las reglas de sesión y borra exclusivamente esa cuenta y sus asignaciones al finalizar. Ejecutarla solo sobre la base local de desarrollo.

Se fijaron overrides para multer 2.5.0 y body-parser 2.4.0, corrigiendo avisos de seguridad transitivos. npm 11.21 interpreta estos overrides correctamente; npm 11.8 puede informar multer como invalid en npm ls pese a la versión corregida instalada. Usar npm 11.21 para actualizar dependencias.
