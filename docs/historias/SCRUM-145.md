# SCRUM-145 · E14-H4 · Reporte de formatos con stock bajo

**Orden:** 53 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-77 · **API:** Sí

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

Estado al 5-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**.
`GET /api/reportes/stock-bajo-minimo` (permiso `reportes.ver`, backend
`src/modulos/reportes/reporte-stock-bajo.controller.ts`). El Swagger no declara la respuesta:
es `FormatoBajoMinimo[]` (`src/modulos/inventario/stock-bajo.service.ts`), el mismo tipo del
aviso del Resumen (SCRUM-115), ya en `compartido/api/respuestas.ts`. Viene ordenada del que más
falta al que menos; lista vacía si no hay.

## Notas de trabajo

- **Sin API simulada:** se usa el endpoint real.
- **Figma P6 no tiene esta sección.** Se reutiliza la tabla (escritorio, P1 2028:682) y la lista
  (celular, P1 2023:206) del aviso del Resumen, extraídas a
  `panel/inventario/formatosBajoMinimo.tsx`; el Resumen se ve igual.
- **Decisiones aprobadas por el usuario (5-11-2026):** tarjeta al final de Reportes a todo el
  ancho; título «Formatos por reponer»; texto vacío «No hay formatos por reponer.»; se muestran
  todos los formatos (el Resumen muestra 5); no se muestran `faltante` ni `activo` (el criterio
  pide stock y mínimo).
- No depende del período: los chips no cambian su consulta.
- **Pendiente:** validar con el equipo de diseño si la sección debe agregarse a P6 en Figma.
- **Backend:** el Swagger debería declarar la respuesta de `/api/reportes/stock-bajo-minimo`.
