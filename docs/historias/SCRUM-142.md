# SCRUM-142 · E14-H1 · Reporte de objetivos OE1 a OE3

**Orden:** 51 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-74 · **API:** No

**Necesita antes (frontend):** [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito ver los indicadores de los objetivos en el panel, con la finalidad de saber si se cumplen las metas.

**Historia backend:** SCRUM-74 · **Figma:** P6 Reportes (objetivos)

## Criterios de aceptación

1. **Indicadores.** El administrador abre «Reportes». Cuando carga. Ve OE1, OE2 y OE3 con valor, meta (30 %, 70 % y 80 %), barra de avance y estado.
2. **Período.** El administrador cambia el filtro de período. Cuando aplica. Los indicadores se actualizan.
3. **Sin datos.** No hay registros en el período. Cuando se muestra. La pantalla lo indica en vez de un valor.

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
