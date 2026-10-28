/**
 * Rutas de la API simulada (ver ./index.ts y docs/api-simulada.md).
 *
 * Agrega aquí las de cada historia importándolas desde un archivo por área
 * (`./tienda.ts`, `./panel-inventario.ts`…). Borra cada ruta cuando su endpoint aparezca en
 * esquema.d.ts: si sigue aquí, tapa al backend real mientras API_SIMULADA=1.
 */
import type { RutaSimulada } from './index';
import { rutasPanelCatalogo } from './panelCatalogo';
import { rutasTienda } from './tienda';

export const rutasSimuladas: readonly RutaSimulada[] = [
  ...rutasTienda,
  ...rutasPanelCatalogo,
];
