# SCRUM-114 · E11-H5 · Inventario: stock y movimientos

**Orden:** 22 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-40 · **API:** No

**Necesita antes (frontend):** [SCRUM-111](SCRUM-111.md)  
**La necesitan después:** [SCRUM-115](SCRUM-115.md)

Como Personal de tienda, necesito consultar el stock y los movimientos en el panel, con la finalidad de saber qué hay, dónde está y a cuánto se compró.

**Historia backend:** SCRUM-40 · **Figma:** P5a Inventario · Stock, P5d Inventario · Movimientos

## Criterios de aceptación

1. **Stock.** El personal abre «Stock». Cuando carga. Ve el stock por formato y ubicación, con bodega elegible, último costo y último proveedor, y una lista filtrada por bajo el mínimo en celular.
2. **Movimientos.** El personal abre «Movimientos». Cuando aplica filtros por tipo y período. Ve entradas, ventas, mermas, consumo, transferencias y reingresos, con referencia y quién los registró.
3. **Sin entradas.** El formato nunca se recibió. Cuando se consulta. Muestra stock cero y sin proveedor ni costo.

## Pantalla y ruta

| Pantalla                     | Escritorio | Celular   | Ruta                            |
| ---------------------------- | ---------- | --------- | ------------------------------- |
| P5a Inventario · Stock       | 2043:1300  | 2044:1067 | `/panel/inventario`             |
| P5d Inventario · Movimientos | 2064:2156  | 2069:1548 | `/panel/inventario/movimientos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 01-11-2026 (`pnpm api:tipos` contra el backend local): **Parcial**.

- **Existe:** `GET /api/inventario/stock/formatos/{id}` (SCRUM-40): stock de **un** formato por
  ubicación, total y última entrada (proveedor y costo), o `ultimaEntrada: null` si nunca se
  recibió. El Swagger no declara la respuesta: tipo `StockFormato` en `respuestas.ts`.
- **Existe:** `GET /api/inventario/stock/bajo-minimo` (SCRUM-41), solo bodega y administración.
- **Falta (simulado):** el listado de stock y el de movimientos. Forma propuesta a SCRUM-40:

`GET /api/inventario/stock?bodegaId&buscar&bajoMinimo=true&pagina&limite`

```ts
{
  items: {
    formatoId: number;
    sku: string;
    producto: string;
    nombreFormato: string;
    imagen: string | null;                         // foto principal del formato
    ubicaciones: { id: number; codigo: string }[]; // con unidades, en la bodega elegida
    stock: number;                                 // en la bodega elegida
    stockMinimo: number | null;
    bajoMinimo: boolean;                           // lo decide el backend
    ultimaEntrada: { costoUnitarioNeto: number; proveedor: { id: number; razonSocial: string } } | null;
  }[];
  total: number; pagina: number; limite: number;
  totalBajoMinimo: number;                         // para el chip «Bajo el mínimo · n»
}
```

`GET /api/inventario/movimientos?bodegaId&grupo&desde&hasta&buscar&pagina&limite`
(`grupo`: `entradas` | `ventas` | `salidas` | `transferencias`; sin él, todos. Propuesta de
agrupación: «entradas» = entrada, ajuste positivo y reingreso; «salidas» = mermas, consumo y
ajuste negativo; la decide el backend)

```ts
{
  items: {
    id: number;
    fechaHora: string;                 // ISO 8601
    tipo: TipoMovimiento;              // valores.ts › TIPOS_MOVIMIENTO
    formato: { id: number; producto: string; nombreFormato: string };
    cantidad: number;                  // con signo; la transferencia, positiva
    ubicacion: UbicacionResumen;       // origen en la transferencia
    destino: UbicacionResumen | null;  // solo transferencia
    referencia: string | null;         // n.º de documento, código del pedido u observación
    registradoPor: { nombre: string } | null; // null: lo registró el sistema
  }[];
  total: number; pagina: number; limite: number;
}
```

Errores de ambos: 401, 403 (sin permiso de consultar inventario).

## Notas de trabajo

**01-11-2026 (rama `SCRUM-114-stock-movimientos`)**

Decisiones:

- **API simulada** para `GET /inventario/stock` y `GET /inventario/movimientos`, con la forma de
  la sección «API» (`compartido/api/simulado/panelStock.ts`, cabecera
  `x-api-simulada: SCRUM-114`). Sin token responden 401, como el backend. Falta pasársela a
  SCRUM-40.
- **Bodega:** «Todas las bodegas» por defecto. Usa las ubicaciones simuladas de SCRUM-111.
- **Flecha de la fila** (y toda la fila en celular): abre un panel lateral con el stock por
  ubicación y la última entrada, del endpoint **real** `GET /inventario/stock/formatos/{id}`.
- **Celular:** la lista parte filtrada por «Bajo el mínimo». En escritorio parte con «Todos».
  Mientras no se sabe el ancho no se marca ningún chip ni se pide nada.
- **Color ámbar** de bajo el mínimo: se adelantó de SCRUM-115 (criterio 2) y lo decide el campo
  `bajoMinimo` del backend.
- **Filtros de Movimientos:** la agrupación propuesta pone ajuste positivo y reingreso en
  «Entradas», y mermas, consumo y ajuste negativo en «Salidas». La aplica el backend con
  `grupo`.
- **Período en celular:** se agregó aunque Figma no lo muestra, porque el criterio 2 lo pide.
- **Bodega en celular:** va como primer filtro (igual que en Entradas), no junto al título.
- **Sin paginación:** Figma P5d solo muestra «Mostrando 9 de 126 movimientos», así que se muestra
  esa leyenda y se filtra para encontrar el resto.
- `consultasSalidas.ts` se unió a `consultasStock.ts`. Registrar una entrada ahora también
  invalida el stock.
- Los filtros comunes (bodega, buscador, fechas y chips) pasaron a `filtrosInventario.tsx`.

Pendiente en el backend (SCRUM-40):

- Implementar los dos listados con la forma de arriba.
- Declarar en el Swagger la respuesta de `/inventario/stock/formatos/{id}`.
- Decidir si ese endpoint recibe `bodegaId`. Hoy el detalle muestra todas las bodegas.

Al llegar los endpoints: `pnpm api:tipos`, borrar `simulado/panelStock.ts`, quitar el cast de
`consultasStock.ts` y los tipos simulados de `respuestas.ts`, y probar sin `API_SIMULADA`.
