# SCRUM-109 · E2-H4 · Vista de precio profesional

**Orden:** 17 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-35 · **API:** Revisar

**Necesita antes (frontend):** [SCRUM-108](SCRUM-108.md)  
**La necesitan después:** [SCRUM-119](SCRUM-119.md), [SCRUM-136](SCRUM-136.md)

Como un Peluquero verificado, necesito ver el precio mayorista y los productos exclusivos en la tienda, con la finalidad de comprar con las condiciones de mi canal.

**Historia backend:** SCRUM-35 · **Figma:** 03 Ficha (peluquero verificado), 01 Inicio («Precio profesional»)

## Criterios de aceptación

1. **Precio profesional.** La cuenta es profesional. Cuando abre un producto. Ve el precio mayorista y el aviso «desde 3 unidades» con el selector de cantidad.
2. **Exclusivos.** Existen productos exclusivos. Cuando el peluquero explora o busca. Aparecen en los listados.
3. **Visitante o cliente.** La cuenta no es profesional. Cuando explora. La interfaz muestra solo precios minoristas y ofrece el acceso a «Precio profesional» para solicitar la verificación.

## Pantalla y ruta

| Pantalla             | Escritorio                   | Celular               | Ruta                  |
| -------------------- | ---------------------------- | --------------------- | --------------------- |
| 03 Ficha de producto | 2007:635 · agotado 2058:3096 | 2007:1706 (peluquero) | `/productos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Revisar**. Confirmar si `/api/tienda/productos` entrega precio mayorista y exclusivos con sesión profesional.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
