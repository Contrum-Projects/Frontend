# SCRUM-115 · E11-H6 · Avisos de stock bajo en el panel

**Orden:** 23 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-41 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-114](SCRUM-114.md)  
**La necesitan después:** [SCRUM-145](SCRUM-145.md)

Como un Bodeguero o Administrador, necesito ver los avisos de stock bajo en el panel, con la finalidad de reponer a tiempo.

**Historia backend:** SCRUM-41 · **Figma:** P1 Resumen, P5a Inventario · Stock

## Criterios de aceptación

1. **Aviso en el resumen.** Hay formatos bajo su mínimo. Cuando el personal abre el resumen. Ve la lista de formatos con stock bajo.
2. **Alerta en inventario.** Un formato está bajo el mínimo. Cuando el personal abre «Stock». La fila lleva la alerta con color de aviso.
3. **Sin avisos.** Ningún formato está bajo el mínimo. Cuando se carga el resumen. No se muestra la alerta.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                |
| ---------------------- | ---------- | --------- | ------------------- |
| P1 Resumen             | 2028:470   | 2023:206  | `/panel`            |
| P5a Inventario · Stock | 2043:1300  | 2044:1067 | `/panel/inventario` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 01-11-2026 (`compartido/api/esquema.d.ts` y backend `main`): **Sí**.

- `GET /api/inventario/stock/bajo-minimo` (SCRUM-41): formatos con mínimo definido cuyo stock
  total (todas las ubicaciones) está bajo él, del que más falta al que menos. Solo bodega y
  administración (`inventario.registrar`): el vendedor recibe 403.
- El Swagger no declara la respuesta: tipo `FormatoBajoMinimo` en `respuestas.ts`, copiado de
  backend `src/modulos/inventario/stock-bajo.service.ts`
  (`{ formatoId, sku, producto, nombreFormato, activo, stockMinimo, stockTotal, faltante }[]`).

## Notas de trabajo

- **01-11-2026:** el criterio 2 («Alerta en inventario») quedó hecho en SCRUM-114. `CifraStock`
  (`panel/inventario/listaStock.tsx`) pinta la cifra con `estado-aviso` cuando el backend marca
  `bajoMinimo`. Prueba: `E11-H6 FE · CA2 alerta en inventario (celular)`. Falta el criterio 1
  (aviso en el resumen).

**01-11-2026 (rama `SCRUM-115-avisos-stock-bajo`)**

- **Criterio 1:** `panel/resumen/avisoStockBajo.tsx` en `/panel`: indicador ámbar «n · Formatos
  con stock bajo» y tarjeta «Stock bajo el mínimo» (tabla en escritorio, lista con «2 / mín. 5»
  en celular) con enlace a `/panel/inventario`. Endpoint **real**, sin API simulada.
- **Criterio 3:** sin formatos bajo el mínimo no se muestra ni el indicador ni la tarjeta
  (decisión del usuario).
- **Filas:** la tarjeta lista los 5 que más faltan (decisión del usuario); el indicador dice el
  total.
- **Permiso:** solo bodeguero y administrador ven el aviso y solo ellos lo piden (igual que el
  backend). El vendedor ve el Resumen sin el aviso.
- La consulta va bajo la clave del stock: registrar un movimiento la vuelve a pedir.
- Los demás indicadores y «Pedidos recientes» de Figma P1 quedan para SCRUM-130 y SCRUM-135.

Pendiente en el backend (SCRUM-41): declarar en el Swagger la respuesta de
`/inventario/stock/bajo-minimo`.
