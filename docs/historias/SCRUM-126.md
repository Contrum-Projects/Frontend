# SCRUM-126 · E9-H2 · Pantalla Datos de facturación

**Orden:** 27 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-54 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-125](SCRUM-125.md)

Como un Cliente, necesito administrar mis datos de facturación, con la finalidad de pedir factura sin escribirlos cada vez.

**Historia backend:** SCRUM-54 · **Figma:** 10b Datos de facturación

## Criterios de aceptación

1. **Lista y alta.** El cliente abre la pantalla. Cuando agrega unos datos. Se guardan RUT, razón social, giro y dirección con región y comuna, y aparecen en la lista.
2. **Varios registros.** La cuenta tiene más de uno. Cuando se muestra la lista. Se pueden ver y elegir todos.
3. **Datos incompletos.** Falta un dato obligatorio. Cuando el cliente guarda. La pantalla señala el campo.

## Pantalla y ruta

| Pantalla                 | Escritorio | Celular   | Ruta                  |
| ------------------------ | ---------- | --------- | --------------------- |
| 10b Datos de facturación | 2066:3519  | 2070:2578 | `/cuenta/facturacion` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
