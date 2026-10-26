# SCRUM-108 · E2-H3 · Ficha de producto y de pack

**Orden:** 16 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-34 · **API:** No

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** [SCRUM-109](SCRUM-109.md), [SCRUM-116](SCRUM-116.md)

Como un Visitante o Cliente, necesito la ficha de producto y de pack, con la finalidad de decidir qué formato comprar.

**Historia backend:** SCRUM-34 · **Figma:** 03 Ficha de producto, 03b Formato agotado, 03c Ficha de pack

## Criterios de aceptación

1. **Formatos y galería.** El usuario abre un producto. Cuando elige un formato. La galería, el precio con «IVA incluido» y la disponibilidad cambian con el formato.
2. **Formato agotado.** El formato no tiene stock. Cuando el usuario lo selecciona. Se marca «Agotado», el botón de agregar queda deshabilitado y se avisa si otro formato sí está disponible.
3. **Pack.** El usuario abre un pack. Cuando carga. Ve los formatos que incluye con cantidades, el precio del pack frente al precio por separado y la disponibilidad del componente más escaso.

## Pantalla y ruta

| Pantalla             | Escritorio                   | Celular               | Ruta                  |
| -------------------- | ---------------------------- | --------------------- | --------------------- |
| 03 Ficha de producto | 2007:635 · agotado 2058:3096 | 2007:1706 (peluquero) | `/productos/[codigo]` |
| 03c Ficha de pack    | 2058:3302                    | —                     | `/packs/[codigo]`     |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. No hay ficha (`/api/tienda/productos/{codigo}`) ni packs.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
