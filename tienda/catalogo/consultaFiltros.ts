import type { paths } from '@/compartido/api/esquema';

/**
 * Orden del listado que el backend aún no tiene: lo responde la API simulada (SCRUM-106).
 * TODO(SCRUM-106): quitar el cast de `consultaProductos` cuando `orden` esté en el Swagger.
 */
export type OrdenTienda = 'mas-vendidos' | 'novedades';

export type ConsultaProductos = NonNullable<
  paths['/api/tienda/productos']['get']['parameters']['query']
>;

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
 * TODO(SCRUM-107): el Swagger tipa `categoriaId` y `marcaId` como un solo número; quitar el cast
 * cuando el backend acepte varios.
 */
export const consultaProductos = ({
  buscar,
  categoriaIds = [],
  marcaIds = [],
  orden,
  pagina,
  limite,
}: FiltrosProductos): ConsultaProductos =>
  ({
    ...(buscar && { buscar }),
    ...(categoriaIds.length > 0 && { categoriaId: categoriaIds }),
    ...(marcaIds.length > 0 && { marcaId: marcaIds }),
    ...(pagina !== undefined && { pagina }),
    ...(limite !== undefined && { limite }),
    ...(orden && { orden }),
  }) as unknown as ConsultaProductos;
