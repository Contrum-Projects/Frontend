# SCRUM-95 · E1-H3 · Cerrar sesión en el dispositivo o en todos

**Orden:** 5 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-21 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** ninguna

Como un Usuario registrado, necesito las opciones de cerrar sesión en la interfaz, con la finalidad de proteger mi cuenta.

**Historia backend:** SCRUM-21 · **Figma:** 10 Cuenta (seguridad), 12 Menú

## Criterios de aceptación

1. **Cerrar sesión.** El usuario tiene la sesión iniciada. Cuando pulsa «Cerrar sesión» en el menú. La interfaz borra la sesión local y muestra el sitio como visitante.
2. **Cerrar en todos los dispositivos.** El usuario está en «Mi cuenta · Seguridad». Cuando elige cerrar sesión en todos los dispositivos. La interfaz pide confirmación y luego lo lleva a iniciar sesión de nuevo.
3. **Sesión revocada.** Otra sesión fue cerrada desde otro dispositivo. Cuando la interfaz recibe un rechazo del servidor. Lleva al usuario a iniciar sesión.

## Pantalla y ruta

| Pantalla                                     | Escritorio | Celular | Ruta            |
| -------------------------------------------- | ---------- | ------- | --------------- |
| 10 Mis datos (datos, direcciones, seguridad) | 2034:2270  | —       | `/cuenta/datos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `DELETE /api/cuentas/sesion`, `/api/cuentas/sesion/todas`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
