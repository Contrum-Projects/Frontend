import type { OrdenTienda } from './consultas';

/** Productos por página del catálogo: 4 filas de 3 en escritorio, 6 de 2 en celular. */
export const POR_PAGINA = 12;
/** «Cargar más» suma páginas hasta este tope, para no pedir cientos de productos de una vez. */
export const MAXIMO_PAGINAS = 20;

const ORDENES: readonly OrdenTienda[] = ['mas-vendidos', 'novedades'];

export const TITULOS_ORDEN: Record<OrdenTienda, string> = {
  'mas-vendidos': 'Más vendidos',
  novedades: 'Novedades',
};

export interface ParametrosCatalogo {
  categoriaId?: number;
  marcaId?: number;
  orden?: OrdenTienda;
  /** Páginas cargadas con «Cargar más» (1 = solo la primera). */
  paginas: number;
}

type Busqueda = Record<string, string | string[] | undefined>;

const primero = (valor: string | string[] | undefined) =>
  Array.isArray(valor) ? valor[0] : valor;

/** Id de la URL: entero positivo, `undefined` si no viene y `null` si viene mal escrito. */
const leerId = (valor: string | undefined): number | undefined | null => {
  if (valor === undefined || valor === '') return undefined;
  return /^[1-9]\d{0,9}$/.test(valor) ? Number(valor) : null;
};

/**
 * Lee `?categoria=&marca=&orden=&pagina=` del catálogo. Devuelve `null` si la categoría o la
 * marca no son un id válido (la página responde 404). Un orden desconocido se ignora y la
 * página queda entre 1 y el tope.
 */
export function leerParametrosCatalogo(
  busqueda: Busqueda,
): ParametrosCatalogo | null {
  const categoriaId = leerId(primero(busqueda.categoria));
  const marcaId = leerId(primero(busqueda.marca));
  if (categoriaId === null || marcaId === null) return null;

  const orden = ORDENES.find((valor) => valor === primero(busqueda.orden));
  const pagina = Number(primero(busqueda.pagina));
  const paginas = Number.isInteger(pagina)
    ? Math.min(Math.max(pagina, 1), MAXIMO_PAGINAS)
    : 1;

  return { categoriaId, marcaId, orden, paginas };
}
