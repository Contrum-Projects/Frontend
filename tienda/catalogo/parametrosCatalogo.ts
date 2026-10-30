import type { OrdenTienda } from './consultas';

/** Productos por página del catálogo: 4 filas de 3 en escritorio, 6 de 2 en celular. */
export const POR_PAGINA = 12;
/** «Cargar más» suma páginas hasta este tope, para no pedir cientos de productos de una vez. */
export const MAXIMO_PAGINAS = 20;
/** El backend rechaza búsquedas de más de 100 caracteres (400); más largo no se envía entero. */
export const MAXIMO_BUSQUEDA = 100;

const ORDENES: readonly OrdenTienda[] = ['mas-vendidos', 'novedades'];

export const TITULOS_ORDEN: Record<OrdenTienda, string> = {
  'mas-vendidos': 'Más vendidos',
  novedades: 'Novedades',
};

export interface ParametrosCatalogo {
  /** Texto del buscador (`?q=`): sin él es el catálogo; con él, la búsqueda. */
  buscar?: string;
  /** Categorías marcadas: productos de cualquiera de ellas (con sus subcategorías). */
  categoriaIds: number[];
  /** Marcas marcadas: productos de cualquiera de ellas. */
  marcaIds: number[];
  orden?: OrdenTienda;
  /** Páginas cargadas con «Cargar más» (1 = solo la primera). */
  paginas: number;
}

type Busqueda = Record<string, string | string[] | undefined>;

const primero = (valor: string | string[] | undefined) =>
  Array.isArray(valor) ? valor[0] : valor;

const todos = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor : [valor]).filter(
    (item): item is string => item !== undefined && item !== '',
  );

/** Ids de la URL (`?categoria=3&categoria=5`) sin repetir, o `null` si alguno viene mal escrito. */
const leerIds = (valor: string | string[] | undefined): number[] | null => {
  const textos = todos(valor);
  if (textos.some((texto) => !/^[1-9]\d{0,9}$/.test(texto))) return null;
  return [...new Set(textos.map(Number))];
};

/**
 * Lee `?q=&categoria=&marca=&orden=&pagina=` del catálogo y de la búsqueda. `categoria` y
 * `marca` se pueden repetir. Devuelve `null` si alguna categoría o marca no es un id válido (la
 * página responde 404). Un orden desconocido se ignora y la página queda entre 1 y el tope.
 */
export function leerParametrosCatalogo(
  busqueda: Busqueda,
): ParametrosCatalogo | null {
  const categoriaIds = leerIds(busqueda.categoria);
  const marcaIds = leerIds(busqueda.marca);
  if (!categoriaIds || !marcaIds) return null;

  const buscar =
    primero(busqueda.q)?.trim().slice(0, MAXIMO_BUSQUEDA) || undefined;
  const orden = ORDENES.find((valor) => valor === primero(busqueda.orden));
  const pagina = Number(primero(busqueda.pagina));
  const paginas = Number.isInteger(pagina)
    ? Math.min(Math.max(pagina, 1), MAXIMO_PAGINAS)
    : 1;

  return { buscar, categoriaIds, marcaIds, orden, paginas };
}
