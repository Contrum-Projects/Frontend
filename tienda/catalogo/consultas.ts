/**
 * Lecturas públicas del catálogo para Server Components (SEO): categorías, marcas, productos y
 * packs, siempre como visitante (sin token, RNF-04). Cada una llama a `connection()`: se piden
 * en cada visita y nunca se guardan en caché, porque traen precios (RNF-30). Úsalas dentro de
 * <Suspense>.
 */
import 'server-only';
import { connection } from 'next/server';
import { exigir } from '@/compartido/api/errores';
import type {
  CategoriaTienda,
  ListadoPacksTienda,
  ListadoTienda,
  MarcaTienda,
} from '@/compartido/api/respuestas';
import type { paths } from '@/compartido/api/esquema';
import { apiServidor } from '@/compartido/api/servidor';

/**
 * Orden del listado que el backend aún no tiene: lo responde la API simulada (SCRUM-106).
 * TODO(SCRUM-106): quitar el cast de `leerProductos` cuando `orden` esté en el Swagger.
 */
export type OrdenTienda = 'mas-vendidos' | 'novedades';

type ConsultaProductos = NonNullable<
  paths['/api/tienda/productos']['get']['parameters']['query']
>;

export interface FiltrosProductos {
  categoriaId?: number;
  marcaId?: number;
  orden?: OrdenTienda;
  pagina?: number;
  limite?: number;
}

export async function leerCategorias(): Promise<CategoriaTienda[]> {
  await connection();
  return exigir<CategoriaTienda[]>(
    await apiServidor().GET('/api/tienda/categorias'),
  );
}

export async function leerMarcas(): Promise<MarcaTienda[]> {
  await connection();
  return exigir<MarcaTienda[]>(await apiServidor().GET('/api/tienda/marcas'));
}

export async function leerProductos({
  orden,
  ...filtros
}: FiltrosProductos): Promise<ListadoTienda> {
  await connection();
  const query = { ...filtros, ...(orden && { orden }) } as ConsultaProductos;
  return exigir<ListadoTienda>(
    await apiServidor().GET('/api/tienda/productos', { params: { query } }),
  );
}

export async function leerPacks(limite: number): Promise<ListadoPacksTienda> {
  await connection();
  return exigir<ListadoPacksTienda>(
    await apiServidor().GET('/api/tienda/packs', {
      params: { query: { limite } },
    }),
  );
}

/** Busca una categoría en el árbol, a cualquier profundidad, con su camino desde la raíz. */
export const buscarCategoria = (
  arbol: CategoriaTienda[],
  id: number,
  camino: CategoriaTienda[] = [],
): CategoriaTienda[] | null => {
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
