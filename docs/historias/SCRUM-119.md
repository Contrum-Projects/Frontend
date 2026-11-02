# SCRUM-119 · E5-H4 · Aviso del mínimo de 3 unidades del peluquero

**Orden:** 26 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-46 · **API:** Sí

> **Cambio de alcance (02-11-2026).** La clienta eliminó el mínimo de 3 unidades del peluquero
> (backend SCRUM-146, decisión del 1 nov que reemplaza a SCRUM-46). Esta historia ya no muestra
> el aviso: **quita el mínimo del frontend**. Los criterios de abajo quedan como registro de Jira.

**Necesita antes (frontend):** [SCRUM-109](SCRUM-109.md), [SCRUM-116](SCRUM-116.md)  
**La necesitan después:** ninguna

Como un Peluquero verificado, necesito ver qué formatos no alcanzan el mínimo, con la finalidad de ajustarlos y comprar al precio profesional.

**Historia backend:** SCRUM-46 · **Figma:** 04 Carrito (con aviso y listo)

## Criterios de aceptación

1. **Bajo el mínimo.** Un formato tiene menos de 3 unidades. Cuando el peluquero ve el carrito. El artículo se marca con el aviso y «Subir a 3» lo corrige.
2. **Mínimo cumplido.** Todos los formatos tienen 3 o más. Cuando se muestra el carrito. El aviso desaparece y se habilita el paso siguiente.

## Pantalla y ruta

| Pantalla   | Escritorio                 | Celular                                       | Ruta       |
| ---------- | -------------------------- | --------------------------------------------- | ---------- |
| 04 Carrito | 2008:872 · listo 2035:2364 | 2008:1927 · listo 2035:4957 · vacío 2060:2231 | `/carrito` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 02-11-2026: **Sí**, sin endpoint nuevo. `GET /api/carrito` y las escrituras del carrito
ya existen (E5-H1). Con SCRUM-146 (PR #49 del backend), las líneas **ya no traen `bajoMinimo`**:
`impideCrearPedido` y `puedeCrearPedido` dependen solo de que el artículo se venda y del stock, y
`POST /api/pedidos` ya no responde 409 por unidades mínimas. Sin API simulada.

## Notas de trabajo

- **Alcance (decidido con el equipo el 02-11-2026):** se reutiliza SCRUM-119 para quitar el
  mínimo del frontend; los textos de Figma solo pierden la mención al mínimo (Figma aún lo muestra).
- **Qué se quitó:** `MINIMO_PROFESIONAL` (`tienda/profesional/precio.ts`); en la ficha, la cantidad
  desde 3, el aviso del mínimo y «Agregar N al carrito» (el peluquero ve «Agregar al carrito»
  desde 1, como todos); en la tarjeta del catálogo, «Mín. 3 unidades»; en «¿Eres peluquero?»,
  «desde 3 unidades»; en el carrito, `bajoMinimo` del tipo `LineaCarrito` y su aviso.
- **Pruebas:** `tienda/carrito/carrito.test.tsx` › «SCRUM-119 · Sin mínimo…» (agregar 1 unidad como
  peluquero; línea de 1 unidad sin aviso y con «Continuar con la compra»). Las de SCRUM-109 en
  `precioProfesional.test.tsx` ahora comprueban que no aparece el mínimo.
- **Esquema:** el backend local en :3000 aún no tenía SCRUM-146, así que `pnpm api:tipos` no
  cambió `esquema.d.ts` (sus descripciones todavía nombran `bajoMinimo`). Regenerar al actualizar
  el backend local.
- **Para el backend:** en `main`, la descripción de `POST /api/carrito/unir` en
  `carrito.controller.ts` todavía dice «lo mismo un formato bajo el mínimo del profesional
  (`bajoMinimo`)»: quedó desactualizada con SCRUM-146.
- **Para el equipo:** Figma (03 Ficha 2007:1779, tarjeta 5:107, 04 Carrito con aviso) y RF-05.10
  siguen mostrando el mínimo; conviene actualizarlos.
