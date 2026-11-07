/**
 * Lecturas públicas del catálogo para Server Components (SEO): categorías, marcas, productos,
 * facetas y packs, siempre como visitante (sin token, RNF-04). Cada una llama a `connection()`:
 * se piden en cada visita y nunca se guardan en caché, porque traen precios (RNF-30). Úsalas
 * dentro de <Suspense>.
 */
import 'server-only';
import { connection } from 'next/server';
import { exigir } from '@/compartido/api/errores';
import type {
  CategoriaTienda,
  FacetasTienda,
  ListadoPacksTienda,
  ListadoTienda,
  MarcaTienda,
} from '@/compartido/api/respuestas';
import { apiServidor } from '@/compartido/api/servidor';
import { consultaProductos, type FiltrosProductos } from './consultaFiltros';

export type { FiltrosProductos, OrdenTienda } from './consultaFiltros';

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

export async function leerProductos(
  filtros: FiltrosProductos,
): Promise<ListadoTienda> {
  await connection();
  return exigir<ListadoTienda>(
    await apiServidor().GET('/api/tienda/productos', {
      params: { query: consultaProductos(filtros) },
    }),
  );
}

/**
 * Cuántos productos hay en cada categoría y marca con estos filtros. Si el backend no responde,
 * los filtros se muestran igual, sin los números: no impiden buscar.
 */
export async function leerFacetas(
  filtros: Pick<FiltrosProductos, 'buscar' | 'categoriaIds' | 'marcaIds'>,
): Promise<FacetasTienda | null> {
  await connection();
  try {
    return exigir<FacetasTienda>(
      await apiServidor().GET('/api/tienda/facetas', {
        params: { query: consultaProductos(filtros) },
      }),
    );
  } catch {
    return null;
  }
}

export async function leerPacks(limite: number): Promise<ListadoPacksTienda> {
  await connection();
  return exigir<ListadoPacksTienda>(
    await apiServidor().GET('/api/tienda/packs', {
      params: { query: { limite } },
    }),
  );
}
