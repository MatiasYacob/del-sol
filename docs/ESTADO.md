# Estado del proyecto

Actualizado el 15 de octubre de 2026.

- Se revisaron los principales documentos de 2026 y sus antecedentes.
- Se eligió el material de 2026 como base y MySQL como requisito obligatorio.
- Se conversó una propuesta de NestJS y React con TypeScript; el ORM está pendiente.
- Se acordó documentar dentro del repositorio y utilizar Git/GitHub.
- Se creó `PREPARACION.md` con alcance, pendientes, herramientas y primera entrega propuesta.
- Se creó el repositorio privado https://github.com/MatiasYacob/del-sol y se publicó la documentación inicial en main. Se instalaron NestJS, React, Vite, TypeScript, Swagger y mysql2. Se agregó una API de salud y un frontend de arranque; no hay funcionalidades del negocio ni persistencia.

## Riesgos y pendientes

Conectividad y operación durante cortes; reglas de stock, caja y cuentas; compatibilidad del ORM con MySQL; diferencias entre cronograma y modelo académico.

## Próximos pasos

1. Resolver conectividad y confirmar stack.
2. Definir colaboradores y reglas de revisión del repositorio.
3. Validar alcance inicial y modelo de datos antes de instalar y programar.


## Validación del entorno

- Node.js 24.13.1 y npm 11.8.0 existentes, sin actualización global.
- Revisión de tipos y compilación correctas.
- npm audit: cero vulnerabilidades conocidas al preparar el entorno.
- MySQL80 detenido; inicio bloqueado por privilegios de Windows. Pendientes base y usuario de desarrollo.
- Docker y ORM pendientes; no se modificaron datos existentes.

- Prueba de arranque temporal: API de salud, Swagger y frontend respondieron HTTP 200.
- Se comentó y formateó el código inicial con separadores #==========#; revisión de tipos y compilación correctas.
- Se extrajo Swagger a src/config/swagger.config.ts; main.ts lo activa mediante setupSwagger(app). Revisión de tipos y compilación del backend correctas.
- Se creó una vista previa del inicio con botones grandes para los diez módulos, diseño adaptable y diálogo de estado. Sin login ni permisos implementados. Tipos y compilación del frontend correctos.
- Se aplicó la paleta arena y ámbar elegida por el usuario y se incorporó el logo original en la cabecera.
- Se reemplazó la cuadrícula por un menú lateral izquierdo con acordeón de Operaciones y Administración, botones de 60 px mínimo y área de trabajo con selección activa. Compilación del frontend verificada.
- 24/10/2026: MySQL responde en el puerto 3306, pero requiere autenticación. Preparados database/setup-development.sql y .env local; pendientes credenciales administrativas, creación de base y usuario. No se ejecutaron cambios SQL.
- 24/10/2026: conexión verificada con mysql2 y credenciales del .env local a del_sol_dev en MySQL Community Server 8.0.45. Prueba de solo lectura; sin cambios en tablas. La conexión todavía no está integrada en NestJS.
- 24/10/2026: MySQL integrado mediante DatabaseModule y DatabaseService con pool mysql2. HealthController separado; GET /api/health/database responde 200 y figura en Swagger. Manejo de conexión fallida verificado con 503. Tipos y compilación correctos. Primera migración de cinco tablas de identidad preparada, pendiente de ejecutar con cuenta administradora en Workbench.
- 24/10/2026: migración 001 ejecutada por el usuario y verificada con consultas de solo lectura: cinco tablas InnoDB, cuatro claves foráneas y tres roles correctos. Sin usuarios ni locales cargados. Pendiente implementar autenticación y alta inicial.
- 24/10/2026: acordados límites de sesión de 5 horas de inactividad y 6 horas absolutas desde el login. Documentados en docs/SEGURIDAD.md; pendientes de implementación en el servidor.
- 24/10/2026: implementado login con Argon2id, sesiones opacas persistidas en MySQL, cookies HttpOnly y CSRF. Guard global, límite de intentos, logout y control de usuario activo. Expiración de 5 horas inactivo / 6 horas absolutas verificada. Migración 002 aplicada por el usuario y utilizada en pruebas; cuenta temporal eliminada. Formulario React verificado en escritorio y móvil con pruebas de navegación. Pendiente crear primer administrador real mediante npm run create-admin -w @del-sol/backend. Sin registro público ni módulos comerciales implementados. Overrides de seguridad: multer 2.5.0 y body-parser 2.4.0; auditoría sin vulnerabilidades conocidas. Cambios locales sin commit ni push.
- Se corrigieron los mensajes del asistente create-admin: distingue contraseña corta, confirmación distinta, credenciales MySQL, migración faltante y usuario duplicado sin revelar datos sensibles. Conexión y rol administrador verificados; aún sin usuarios creados.
- 24/10/2026: el usuario confirmó la creación de su administrador y un inicio de sesión correcto. Preparada entrega de integración MySQL, autenticación y menú lateral. Contraseñas y .env excluidos del repositorio.
