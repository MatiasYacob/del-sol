# Preparación del proyecto Del Sol

Estado al 15 de octubre de 2026. Este documento reúne la base de trabajo; las propuestas de alcance y tecnología todavía deben validarse antes de implementar.

## Objetivo y fuentes

Desarrollar el sistema de gestión de Distribuidora Del Sol para sus tres locales, tomando como fuente el material de `Taller de integracion/TALLER 2026`. El material de 2019 es un antecedente, no una especificación vigente. El dictamen de octubre de 2026 aprueba el informe, no acredita un sistema terminado.

## Decisiones y propuestas

| Tema | Estado |
|---|---|
| Base de datos MySQL | Obligatoria, confirmado por el usuario |
| Lenguajes conocidos | Java, JavaScript, Python y TypeScript |
| Backend NestJS y frontend React con TypeScript | Propuesta conversada; confirmar antes de instalar |
| Vite y Tailwind CSS | Propuestos para el frontend |
| Arquitectura | Propuesta: un backend modular y un frontend, en un repositorio |
| Acceso a datos | Pendiente: comprobar soporte vigente de MySQL y elegir ORM y versión |
| Git y GitHub | Repositorio privado creado: MatiasYacob/del-sol |
| Documentación | Markdown en el repositorio, OpenAPI/Swagger, draw.io y Mermaid; entregas académicas en Word/PDF |
| Chatbot | Alcance documentado: consultas de precios, stock, clientes y cuentas corrientes; implementación pendiente |

## Alcance del informe

Productos, stock, clientes y sus cuentas corrientes, ventas minoristas y mayoristas, remitos, proveedores y sus obligaciones, presupuestos, órdenes de compra, usuarios y roles, cierre de caja, reportes y chatbot.

Debemos mantener trazabilidad entre requisitos, casos de uso, tablas, implementación y validación. Ninguna división en entregas elimina funciones comprometidas en el informe.

## Información necesaria antes de implementar ventas

- Conectividad: ¿todos los locales pueden depender de internet? ¿deben vender durante cortes?
- Stock: ¿se controla por local? ¿hay depósitos, transferencias, productos fraccionados o stock negativo permitido?
- Ventas: medios de pago, descuentos, precios mayorista/minorista, numeración de remitos, anulaciones y devoluciones.
- Caja: apertura, cierre por usuario o turno, gastos, retiros, diferencias y medios de pago incluidos.
- Cuentas corrientes: pagos parciales, saldos iniciales, imputación de pagos y autorización para ajustes.
- Compras: diferencia entre pedir, recibir mercadería y registrar deuda; recepciones parciales y devoluciones.
- Usuarios: matriz de permisos por rol y local; operaciones exclusivas del dueño.
- Chatbot: menú guiado o preguntas libres; canales y permisos de consulta.
- Instalación: equipos, navegadores, impresoras, conexión y responsable de operación.
- Datos iniciales: origen y formato de productos, clientes, proveedores, stock y saldos. Usar datos ficticios para desarrollo.
- Cronograma: conciliar el Gantt existente con la duración indicada por el modelo de la cátedra.

## Preparación técnica

- Confirmar el stack y las versiones compatibles con MySQL.
- Disponer de Git, Node.js en una versión soportada por el stack y un gestor de paquetes.
- Disponer de MySQL para desarrollo; elegir instalación local o contenedor. Docker es opcional.
- Definir cuenta u organización de GitHub, nombre y visibilidad del repositorio y colaboradores.
- Crear `.gitignore` y `.env.example`; excluir secretos, datos reales, dependencias instaladas y archivos temporales.
- Versionar migraciones y datos ficticios de ejemplo. No versionar backups de producción.
- Configurar revisión de tipos, compilación y pruebas de reglas críticas en integración continua.
- Elegir hosting y copias de seguridad antes del despliegue; no contratar servicios durante la preparación.

## Primera entrega propuesta

Una base ejecutable con inicio de sesión, roles, locales y catálogo de productos de ejemplo. Debe poder instalarse siguiendo el README, aplicar migraciones en una base de desarrollo y demostrar restricciones de acceso. Las ventas se implementarán después de validar sus reglas y el modelo de datos.

## Módulos previstos

| Módulo | Propósito y entradas | Salidas | Sistemas que modifica | Validación |
|---|---|---|---|---|
| Usuarios y locales | Identidad, roles y asignaciones | Accesos autorizados | Usuarios, roles, locales | Accesos permitidos y rechazados |
| Productos y stock | Catálogo, ingresos, egresos y transferencias | Existencias por local e historial | Productos y movimientos de stock | Cantidades, concurrencia y trazabilidad |
| Ventas y caja | Productos, cantidades, precios y cobros | Venta, remito y movimientos | Ventas, stock, caja y cuenta del cliente | Atomicidad, totales y reintentos |
| Clientes y cuentas | Datos, cargos, pagos y ajustes | Saldo e historial | Clientes y movimientos de cuenta | Pagos parciales y conciliación |
| Proveedores y compras | Pedidos, recepciones, comprobantes y pagos | Stock recibido y obligaciones | Compras, stock y cuenta del proveedor | Recepciones y saldos |
| Presupuestos | Productos, precios y cantidades | Presupuesto imprimible | Presupuestos | No altera stock, caja ni deuda |
| Reportes | Filtros y operaciones registradas | Consultas y exportaciones | Archivos de salida | Totales conciliados y permisos |
| Chatbot | Consulta e identidad del usuario | Respuesta autorizada | Sesión conversacional si corresponde | Respuestas y restricciones de acceso |

El desarrollo local y reversible se realiza dentro del alcance autorizado. Publicaciones, gastos, accesos externos y cambios irreversibles requieren autorización del usuario. Las reglas que afecten stock, caja y deuda deben presentarse y validarse antes de integrar esos módulos.

## Organización prevista

`apps/backend`, `apps/frontend`, `docs` y, solo si hace falta, `packages` para código compartido. Mantener los originales académicos en su ubicación actual.

Cada funcionalidad debe incluir su documentación, migraciones cuando correspondan y verificación proporcional al riesgo. Registrar las decisiones de arquitectura y mantener un archivo de estado breve.

