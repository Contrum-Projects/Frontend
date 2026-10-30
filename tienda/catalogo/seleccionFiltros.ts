/** Categorías y marcas marcadas en los filtros del catálogo (SCRUM-107). */
export interface SeleccionFiltros {
  categoriaIds: number[];
  marcaIds: number[];
}

/** Lo que necesitan las búsquedas en el árbol: sirve con las categorías y con sus opciones. */
export interface NodoCategoria<T> {
  id: number;
  subcategorias: T[];
}

/** Busca una categoría en el árbol, a cualquier profundidad, con su camino desde la raíz. */
export const buscarCategoria = <T extends NodoCategoria<T>>(
  arbol: T[],
  id: number,
  camino: T[] = [],
): T[] | null => {
  for (const nodo of arbol) {
    if (nodo.id === id) return [...camino, nodo];
    const encontrada = buscarCategoria(nodo.subcategorias, id, [
      ...camino,
      nodo,
    ]);
    if (encontrada) return encontrada;
  }
  return null;
};

const idsDescendientes = <T extends NodoCategoria<T>>(nodo: T): number[] =>
  nodo.subcategorias.flatMap((sub) => [sub.id, ...idsDescendientes(sub)]);

/**
 * Marca o desmarca una categoría. Una categoría ya incluye sus subcategorías (lo resuelve el
 * backend), así que marcarla desmarca sus subcategorías y sus categorías superiores: tener las
 * dos marcadas no cambiaría los resultados.
 */
export const alternarCategoria = <T extends NodoCategoria<T>>(
  arbol: T[],
  seleccion: SeleccionFiltros,
  id: number,
): SeleccionFiltros => {
  if (seleccion.categoriaIds.includes(id)) {
    return {
      ...seleccion,
      categoriaIds: seleccion.categoriaIds.filter((item) => item !== id),
    };
  }
  const camino = buscarCategoria(arbol, id) ?? [];
  const relacionadas = new Set([
    ...camino.slice(0, -1).map((nodo) => nodo.id),
    ...(camino.length > 0 ? idsDescendientes(camino[camino.length - 1]) : []),
  ]);
  return {
    ...seleccion,
    categoriaIds: [
      ...seleccion.categoriaIds.filter((item) => !relacionadas.has(item)),
      id,
    ],
  };
};

export const alternarMarca = (
  seleccion: SeleccionFiltros,
  id: number,
): SeleccionFiltros => ({
  ...seleccion,
  marcaIds: seleccion.marcaIds.includes(id)
    ? seleccion.marcaIds.filter((item) => item !== id)
    : [...seleccion.marcaIds, id],
});

/** Cuántos filtros hay marcados: el número de «Filtros (n)» en el celular. */
export const contarFiltros = (seleccion: SeleccionFiltros) =>
  seleccion.categoriaIds.length + seleccion.marcaIds.length;
