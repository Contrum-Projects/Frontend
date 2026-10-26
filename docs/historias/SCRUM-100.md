# SCRUM-100 · E3-H1 · Panel de productos: listado y formulario

**Orden:** 10 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-26 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-101](SCRUM-101.md), [SCRUM-132](SCRUM-132.md)

Como Personal de tienda, necesito el listado de productos y su formulario en el panel, con la finalidad de mantener el catálogo desde el celular o el computador.

**Historia backend:** SCRUM-26 · **Figma:** P3a Productos, P3 Producto nuevo · **RNF-25**

## Criterios de aceptación

1. **Listado.** El personal abre «Productos». Cuando carga. Ve foto principal, categoría, formatos, precio desde, stock total, estado y origen de la descripción, con filtros por exclusivos, stock bajo e inactivos.
2. **Crear y editar.** El personal abre el formulario. Cuando guarda. La pantalla muestra los campos faltantes marcados o la confirmación.
3. **Desactivar.** El producto está activo. Cuando el personal lo desactiva. La pantalla pide confirmación y lo muestra como inactivo.
4. **Uso desde el celular y el computador.** El panel se abre en un teléfono o en un computador. Cuando el personal crea o edita un producto. El formulario se adapta a la pantalla, sin desplazamiento horizontal.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular   | Ruta                                              |
| --------------------------- | ---------- | --------- | ------------------------------------------------- |
| P3a Productos               | 2039:980   | 2039:5857 | `/panel/productos`                                |
| P3 Producto nuevo / edición | 2029:658   | 2024:443  | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/productos`, `/{id}`, `/{id}/desactivar`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
