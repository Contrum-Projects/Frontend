# SCRUM-110 · E11-H1 · Pantalla Proveedores

**Orden:** 18 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-36 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-111](SCRUM-111.md)

Como Personal de tienda, necesito la pantalla de proveedores, con la finalidad de registrar a quién se le compra.

**Historia backend:** SCRUM-36 · **Figma:** P5f Inventario · Proveedores

## Criterios de aceptación

1. **Listado.** El personal abre la pestaña «Proveedores». Cuando carga. Ve RUT, razón social, contacto y cantidad de entradas de cada uno.
2. **Nuevo proveedor.** El personal pulsa «Nuevo proveedor». Cuando guarda. Aparece en la lista.
3. **RUT repetido.** El servidor rechaza el RUT. Cuando el personal guarda. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla        | Escritorio | Celular   | Ruta                            |
| --------------- | ---------- | --------- | ------------------------------- |
| P5f Proveedores | 2064:3094  | 2069:1819 | `/panel/inventario/proveedores` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/inventario/proveedores`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
