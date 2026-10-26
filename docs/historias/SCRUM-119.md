# SCRUM-119 · E5-H4 · Aviso del mínimo de 3 unidades del peluquero

**Orden:** 26 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-46 · **API:** No

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

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
