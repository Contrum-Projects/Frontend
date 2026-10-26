# SCRUM-143 · E14-H2 · Reporte de ventas

**Orden:** 50 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-75 · **API:** No

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-142](SCRUM-142.md), [SCRUM-144](SCRUM-144.md), [SCRUM-145](SCRUM-145.md)

Como un Administrador, necesito ver las ventas por período y tipo de cliente, con la finalidad de conocer el desempeño minorista y mayorista.

**Historia backend:** SCRUM-75 · **Figma:** P6 Reportes (ventas)

## Criterios de aceptación

1. **Ventas.** El administrador abre «Reportes». Cuando carga. Ve pedidos y montos por mes, separados por cliente y profesional, con un resumen.
2. **Sin ventas.** No hay pedidos en el período. Cuando se muestra. Los totales aparecen en cero.

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
