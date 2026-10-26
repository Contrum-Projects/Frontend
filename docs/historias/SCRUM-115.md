# SCRUM-115 · E11-H6 · Avisos de stock bajo en el panel

**Orden:** 23 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-41 · **API:** No

**Necesita antes (frontend):** [SCRUM-114](SCRUM-114.md)  
**La necesitan después:** [SCRUM-145](SCRUM-145.md)

Como un Bodeguero o Administrador, necesito ver los avisos de stock bajo en el panel, con la finalidad de reponer a tiempo.

**Historia backend:** SCRUM-41 · **Figma:** P1 Resumen, P5a Inventario · Stock

## Criterios de aceptación

1. **Aviso en el resumen.** Hay formatos bajo su mínimo. Cuando el personal abre el resumen. Ve la lista de formatos con stock bajo.
2. **Alerta en inventario.** Un formato está bajo el mínimo. Cuando el personal abre «Stock». La fila lleva la alerta con color de aviso.
3. **Sin avisos.** Ningún formato está bajo el mínimo. Cuando se carga el resumen. No se muestra la alerta.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                |
| ---------------------- | ---------- | --------- | ------------------- |
| P1 Resumen             | 2028:470   | 2023:206  | `/panel`            |
| P5a Inventario · Stock | 2043:1300  | 2044:1067 | `/panel/inventario` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
