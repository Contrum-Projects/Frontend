import type { paths } from '@/compartido/api/esquema';

export type ConsultaProductos = NonNullable<
  paths['/api/tienda/productos']['get']['parameters']['query']
>;

/**
 * Orden del listado (backend: `ORDENES_TIENDA`, SCRUM-150): «más vendidos» y «novedades» los
 * decide el backend.
 */
export type OrdenTienda = NonNullable<ConsultaProductos['orden']>;

export interface FiltrosProductos {
  buscar?: string;
  categoriaIds?: number[];
  marcaIds?: number[];
  orden?: OrdenTienda;
  pagina?: number;
  limite?: number;
}

/**
 * Consulta de `/tienda/productos` y `/tienda/facetas`, sin los filtros vacíos. Varias categorías o
 * marcas repiten el parámetro (`categoriaId=3&categoriaId=5`), como lo pide SCRUM-107.
 */
export const consultaProductos = ({
  buscar,
  categoriaIds = [],
  marcaIds = [],
  orden,
  pagina,
  limite,
}: FiltrosProductos): ConsultaProductos => ({
  ...(buscar && { buscar }),
  ...(categoriaIds.length > 0 && { categoriaId: categoriaIds }),
  ...(marcaIds.length > 0 && { marcaId: marcaIds }),
  ...(pagina !== undefined && { pagina }),
  ...(limite !== undefined && { limite }),
  ...(orden && { orden }),
});
