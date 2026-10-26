# SCRUM-111 · E11-H2 · Entradas de inventario

**Orden:** 19 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-37 · **API:** No

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md), [SCRUM-110](SCRUM-110.md)  
**La necesitan después:** [SCRUM-112](SCRUM-112.md), [SCRUM-114](SCRUM-114.md)

Como Personal de tienda, necesito registrar entradas de inventario desde el panel, con la finalidad de aumentar el stock con respaldo.

**Historia backend:** SCRUM-37 · **Figma:** P5e Inventario · Entradas, P5 Entrada de inventario

## Criterios de aceptación

1. **Lista de entradas.** El personal abre «Entradas». Cuando carga. Ve fecha, factura o guía, proveedor, ubicación, formatos, unidades, costo neto y quién la registró.
2. **Nueva entrada.** El personal completa proveedor, fecha, documento, ubicación y formatos con cantidad y costo. Cuando guarda. La tabla muestra los subtotales y se confirma el registro.
3. **Errores.** Falta un dato o un formato se repite. Cuando el servidor lo rechaza. La pantalla señala la fila o el campo.

## Pantalla y ruta

| Pantalla                        | Escritorio                  | Celular                    | Ruta                                                             |
| ------------------------------- | --------------------------- | -------------------------- | ---------------------------------------------------------------- |
| P5e Entradas · P5 Entrada nueva | 2064:2663 · nueva 2029:4319 | 2069:1703 · nueva 2025:603 | `/panel/inventario/entradas`, `/panel/inventario/entradas/nueva` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
