/**
 * Lecturas públicas de la ficha para Server Components (SEO), siempre como visitante (sin
 * token, RNF-04): el precio profesional se pide desde el navegador (SCRUM-109). Llaman a
 * `connection()`: se piden en cada visita y no se guardan en caché, porque traen precios y
 * stock (RNF-30). `cache` de React evita pedirlas dos veces en la misma petición (metadatos y
 * página). Úsalas dentro de <Suspense>.
 */
import 'server-only';
import { connection } from 'next/server';
import { cache } from 'react';
import { exigir } from '@/compartido/api/errores';
import type { PackDetalle, ProductoDetalle } from '@/compartido/api/respuestas';
import { apiServidor } from '@/compartido/api/servidor';

export { leerId } from './idFicha';

/** `null` si el backend responde 404: no existe, no está a la venta o es exclusivo. */
export const leerProducto = cache(
  async (id: number): Promise<ProductoDetalle | null> => {
    await connection();
    const resultado = await apiServidor().GET('/api/tienda/productos/{id}', {
      params: { path: { id } },
    });
    if (resultado.response.status === 404) return null;
    return exigir<ProductoDetalle>(resultado);
  },
);

/** `null` si el backend responde 404: no existe, no está vigente, no está a la venta o es exclusivo. */
export const leerPack = cache(
  async (id: number): Promise<PackDetalle | null> => {
    await connection();
    const resultado = await apiServidor().GET('/api/tienda/packs/{id}', {
      params: { path: { id } },
    });
    if (resultado.response.status === 404) return null;
    return exigir<PackDetalle>(resultado);
  },
);
