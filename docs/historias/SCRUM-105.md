# SCRUM-105 · E3-H6 · Pantalla Pack nuevo

**Orden:** 14 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-31 · **API:** No

**Necesita antes (frontend):** [SCRUM-102](SCRUM-102.md), [SCRUM-104](SCRUM-104.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito crear packs desde el panel, con la finalidad de ofrecer promociones armadas.

**Historia backend:** SCRUM-31 · **Figma:** P3c Pack nuevo

## Criterios de aceptación

1. **Componentes.** El personal arma el pack. Cuando agrega formatos con su cantidad. La tabla muestra el stock de cada componente.
2. **Solo formatos.** El personal busca un componente. Cuando escribe. La búsqueda muestra solo formatos de producto, nunca otros packs.
3. **Disponibilidad y vigencia.** El pack tiene componentes y vigencia opcional. Cuando se guarda. El panel muestra la disponibilidad del componente más escaso, los precios con su valor con IVA y las fotos propias del pack.

## Pantalla y ruta

| Pantalla       | Escritorio | Celular   | Ruta                 |
| -------------- | ---------- | --------- | -------------------- |
| P3c Pack nuevo | 2065:2381  | 2065:9091 | `/panel/packs/nuevo` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. No hay endpoints de packs.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
