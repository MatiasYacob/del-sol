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
