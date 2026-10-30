import type {
  CategoriaTienda,
  FacetasTienda,
  MarcaTienda,
} from '@/compartido/api/respuestas';

/** Una casilla del filtro de categorías, con sus subcategorías debajo. */
export interface OpcionCategoria {
  id: number;
  nombre: string;
  /** Productos con los demás filtros; sin facetas (el backend no respondió), no se muestra. */
  total?: number;
  subcategorias: OpcionCategoria[];
}

export interface OpcionMarca {
  id: number;
  nombre: string;
  total?: number;
}

const totales = (lista: FacetasTienda['categorias']) =>
  new Map(lista.map(({ id, total }) => [id, total]));

/**
 * Opciones del filtro de categorías: el árbol con el total de cada una. Con facetas quedan solo
 * las que tienen productos (y las marcadas, para poder desmarcarlas); sin facetas, todas.
 */
export const opcionesCategorias = (
  arbol: CategoriaTienda[],
  facetas: FacetasTienda | null,
  marcadas: number[],
): OpcionCategoria[] => {
  const total = facetas ? totales(facetas.categorias) : null;
  const armar = (nodos: CategoriaTienda[]): OpcionCategoria[] =>
    nodos.flatMap((nodo) => {
      const subcategorias = armar(nodo.subcategorias);
      const visible =
        !total ||
        (total.get(nodo.id) ?? 0) > 0 ||
        marcadas.includes(nodo.id) ||
        subcategorias.length > 0;
      if (!visible) return [];
      return [
        {
          id: nodo.id,
          nombre: nodo.nombre,
          total: total ? (total.get(nodo.id) ?? 0) : undefined,
          subcategorias,
        },
      ];
    });
  return armar(arbol);
};

/** Opciones del filtro de marcas, con el mismo criterio que las categorías. */
export const opcionesMarcas = (
  marcas: MarcaTienda[],
  facetas: FacetasTienda | null,
  marcadas: number[],
): OpcionMarca[] => {
  const total = facetas ? totales(facetas.marcas) : null;
  return marcas
    .filter(
      (marca) =>
        !total || (total.get(marca.id) ?? 0) > 0 || marcadas.includes(marca.id),
    )
    .map((marca) => ({
      id: marca.id,
      nombre: marca.nombre,
      total: total ? (total.get(marca.id) ?? 0) : undefined,
    }));
};
