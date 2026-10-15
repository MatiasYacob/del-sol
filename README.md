# Del Sol

Sistema de gestión para los tres locales de Distribuidora Del Sol, basado en el proyecto de Taller de Integración 2026.

## Estado

Entorno inicial ejecutable con frontend React y API NestJS. Las funcionalidades del negocio todavía no están implementadas.

MySQL es obligatorio. NestJS y React con TypeScript están instalados; el ORM está pendiente de selección. Las versiones exactas están fijadas en los package.json y package-lock.json.

## Desarrollo local

Requiere Node.js 24.13.1 o superior dentro de la rama 24 y npm. Desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

- Frontend: http://127.0.0.1:5173
- Salud de la API: http://127.0.0.1:3000/api/health
- Documentación Swagger: http://127.0.0.1:3000/api/docs

La configuración de Swagger está en `apps/backend/src/config/swagger.config.ts`.
El archivo `main.ts` la activa mediante `setupSwagger(app)` después de definir el prefijo de la API.

Detener con Ctrl+C. Para verificar tipos y compilar:

```sh
npm run typecheck
npm run build
```

La ruta de salud solo comprueba que la API responde; no comprueba conexión con MySQL.

## MySQL

Se encontró MySQL Server 8.0.45 instalado localmente. Su servicio `MySQL80` está detenido y el inicio requiere privilegios de administrador. La instalación de XAMPP corresponde a MariaDB y no es la base elegida para este proyecto.

Pendiente: iniciar MySQL80, crear una base y usuario exclusivos de desarrollo y elegir el ORM antes de implementar persistencia. El controlador mysql2 ya está instalado. No se han modificado bases existentes.

Copiar `apps/backend/.env.example` a `apps/backend/.env` y completar la configuración local cuando se prepare la base. Nunca subir ese archivo ni contraseñas al repositorio. La API todavía no utiliza esas variables de base de datos.

## Documentación

- [Preparación del proyecto](docs/PREPARACION.md)
- [Estado y próximos pasos](docs/ESTADO.md)

## Trabajo con Git

La rama principal es `main`. Trabajar en ramas por tarea e integrar mediante pull requests. Versionar documentación y migraciones junto con los cambios de aplicación.

No subir secretos, datos reales de clientes ni backups de producción. Los documentos académicos originales se conservan fuera de este repositorio.
