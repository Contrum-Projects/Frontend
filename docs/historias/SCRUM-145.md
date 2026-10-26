# SCRUM-145 · E14-H4 · Reporte de formatos con stock bajo

**Orden:** 53 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-77 · **API:** No

**Necesita antes (frontend):** [SCRUM-115](SCRUM-115.md), [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito ver los formatos bajo su mínimo, con la finalidad de planificar la reposición.

**Historia backend:** SCRUM-77 · **Figma:** P1 Resumen, P6 Reportes

## Criterios de aceptación

1. **Con formatos.** Hay formatos bajo el mínimo. Cuando el administrador abre el reporte. Ve cada formato con su stock actual y su mínimo.
2. **Sin formatos.** Ninguno está bajo el mínimo. Cuando se muestra. La pantalla indica que no hay formatos por reponer.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta              |
| ----------- | ---------- | --------- | ----------------- |
| P6 Reportes | 2041:1229  | 2042:1010 | `/panel/reportes` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
