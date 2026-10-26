# SCRUM-117 · E5-H2 · Carrito del visitante en el navegador

**Orden:** 25 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-44 · **API:** No

**Necesita antes (frontend):** [SCRUM-116](SCRUM-116.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito que mi carrito se conserve al iniciar sesión, con la finalidad de no perder lo que elegí.

**Historia backend:** SCRUM-44 · **Figma:** 04 Carrito

## Criterios de aceptación

1. **Sin sesión.** El visitante agrega artículos. Cuando cierra y vuelve a abrir el navegador. El carrito sigue ahí.
2. **Al iniciar sesión.** El visitante tiene artículos y su cuenta tenía un carrito. Cuando inicia sesión. La interfaz envía los artículos al servidor y muestra el carrito unido.

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
