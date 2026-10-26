# SCRUM-133 · E4-H2 · Aceptar, editar o descartar la sugerencia

**Orden:** 41 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-61 · **API:** No

**Necesita antes (frontend):** [SCRUM-132](SCRUM-132.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito revisar la sugerencia antes de publicarla, con la finalidad de asegurar que lo publicado sea correcto.

**Historia backend:** SCRUM-61 · **Figma:** P3 Producto nuevo, P3a Productos (origen de la descripción)

## Criterios de aceptación

1. **Tres acciones.** Hay una sugerencia en pantalla. Cuando el personal la acepta, la edita o la descarta. La interfaz envía el origen correcto (IA, IA editada o manual).
2. **Sin publicar sin revisar.** El personal sale sin confirmar. Cuando intenta salir. La interfaz avisa que la sugerencia no se guardará.
3. **Origen visible.** El producto ya existe. Cuando el personal abre el listado. Ve el origen de la descripción: manual, IA o IA editada.

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
