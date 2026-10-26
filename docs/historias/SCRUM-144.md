# SCRUM-144 · E14-H3 · Reporte de carritos y campañas

**Orden:** 52 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-76 · **API:** No

**Necesita antes (frontend):** [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito ver carritos abandonados y resultados de campañas, con la finalidad de evaluar el marketing.

**Historia backend:** SCRUM-76 · **Figma:** P6 Reportes (carritos y campañas)

## Criterios de aceptación

1. **Carritos.** El administrador abre «Reportes». Cuando carga. Ve por mes los carritos abandonados y los recuperados.
2. **Campañas.** Existe una campaña enviada. Cuando el administrador la consulta. Ve enviados, abiertos, con clic, rebotados, cancelados y fallidos; en celular, la última campaña desde la pestaña «Más».

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
