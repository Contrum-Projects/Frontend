# SCRUM-116 · E5-H1 · Pantalla del carrito

**Orden:** 24 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-43 · **API:** No

**Necesita antes (frontend):** [SCRUM-108](SCRUM-108.md)  
**La necesitan después:** [SCRUM-117](SCRUM-117.md), [SCRUM-119](SCRUM-119.md), [SCRUM-118](SCRUM-118.md)

Como un Cliente, necesito el carrito en la tienda, con la finalidad de armar mi compra antes de pagar.

**Historia backend:** SCRUM-43 · **Figma:** 04 Carrito, 04b Carrito vacío

## Criterios de aceptación

1. **Agregar y cambiar.** El cliente agrega desde la ficha. Cuando cambia cantidades o quita artículos. El carrito recalcula los totales con «IVA incluido».
2. **Artículo con problema.** Un artículo supera el stock. Cuando se muestra el carrito. Se marca con aviso y el paso siguiente queda bloqueado hasta ajustarlo.
3. **Carrito vacío.** No hay artículos. Cuando el cliente abre el carrito. Ve el mensaje y el botón al catálogo.

## Pantalla y ruta

| Pantalla   | Escritorio                 | Celular                                       | Ruta       |
| ---------- | -------------------------- | --------------------------------------------- | ---------- |
| 04 Carrito | 2008:872 · listo 2035:2364 | 2008:1927 · listo 2035:4957 · vacío 2060:2231 | `/carrito` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
