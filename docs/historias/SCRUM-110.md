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

Estado al 31-10-2026: **Sí**, con un faltante. `GET /api/inventario/proveedores` (activos, por
razón social) y `POST /api/inventario/proveedores` con `proveedores.gestionar` (administrador y
bodeguero); el POST responde 409 «Ya existe un proveedor con ese RUT.». El Swagger **no declara
las respuestas**: el tipo `Proveedor` está en `compartido/api/respuestas.ts` citando
`proveedores.service.ts`.

**Falta en el backend (pedido a SCRUM-36):** la cantidad de entradas de cada proveedor
(criterio 1). Forma propuesta: `cantidadEntradas: number` en cada fila del GET (por ejemplo con
`_count: { entradas }` de Prisma). Mientras no llegue, la columna muestra «—».

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**31-10-2026**

- PR: https://github.com/Contrum-Projects/Frontend/pull/30 (integrado el 31-10-2026).
- Pendiente del backend tras integrar: `cantidadEntradas` en el GET (criterio 1, pedido a SCRUM-36); mientras tanto la columna «Entradas» muestra «—».
- Sin API simulada: la pantalla usa solo el backend real.
- «Nuevo proveedor» es un panel lateral como «Nueva cuenta de personal» (Figma no lo dibuja):
  Razón social, RUT, Nombre de contacto, Correo y Teléfono (los tres últimos opcionales). Los
  errores 400 y el 409 van junto a su campo según cómo empieza el mensaje del backend.
- Pestañas Stock, Movimientos, Entradas y Proveedores como enlaces, según el permiso de cada ruta
  (`puedeAbrir`): el vendedor no ve Entradas ni Proveedores. Stock y Movimientos (SCRUM-114) y
  Entradas (SCRUM-111) aún no tienen página (`as Route` con TODO).
- El buscador «RUT o razón social» filtra en el navegador la lista ya cargada: la API no busca.
- En celular se omite «Bodega principal ▾»: es de Stock (SCRUM-114).
- Pendiente del backend: `cantidadEntradas` en el GET y declarar las respuestas en el Swagger.
