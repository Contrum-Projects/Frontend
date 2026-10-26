# SCRUM-132 · E4-H1 · Sugerencia de IA en el producto nuevo

**Orden:** 40 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-60 · **API:** No

**Necesita antes (frontend):** [SCRUM-100](SCRUM-100.md)  
**La necesitan después:** [SCRUM-133](SCRUM-133.md)

Como Personal de tienda, necesito pedir la descripción sugerida desde el formulario del producto, con la finalidad de no escribirla desde cero.

**Historia backend:** SCRUM-60 · **Figma:** P3 Producto nuevo (sugerencia de IA)

## Criterios de aceptación

1. **Generar.** El personal sube la foto del reverso. Cuando pulsa «Generar descripción». Se muestra un estado de carga y luego la descripción sugerida y los ingredientes.
2. **Sin resultado.** La foto no es legible o el servicio no responde. Cuando termina la solicitud. La pantalla lo informa y deja escribir la descripción a mano.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
