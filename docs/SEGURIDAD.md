# Seguridad y autenticación

## Duración de sesiones

Decisión del usuario del 24 de octubre de 2026:

- Tiempo máximo de inactividad: **5 horas** (18.000 segundos).
- Duración absoluta máxima: **6 horas** (21.600 segundos) desde el inicio de sesión.
- La sesión vence al alcanzar cualquiera de los dos límites.
- La actividad autenticada renueva el plazo de inactividad, pero no modifica la fecha de inicio ni extiende el límite absoluto.
- Abrir una pestaña sin interacción, consultas automáticas y comprobaciones periódicas de estado no deben mantener una sesión activa indefinidamente.
- Cerrar sesión debe invalidar la sesión en el servidor.
- Los límites se verificarán en el servidor; no dependerán solo de la cookie o del reloj del navegador.

Ejemplos: una sesión iniciada a las 08:00 sin actividad vence a las 13:00. Si se utiliza a las 12:00, el límite absoluto sigue siendo las 14:00.

## Estado de implementación

Los límites están implementados en el módulo de autenticación del backend. El almacenamiento de sesiones en MySQL, las cookies HttpOnly y el formulario de login se describen en [LOGIN.md](LOGIN.md).
