'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { CategoriaTienda, MarcaPanel } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/**
 * Marcas y árbol de categorías del panel (E3-H4). El formulario de producto (E3-H1) usa las
 * mismas claves, así una marca o categoría nueva aparece también en sus selectores.
 */
export const CLAVES_CATALOGO = {
  marcas: ['panel', 'catalogo', 'marcas'],
  categorias: ['panel', 'catalogo', 'categorias'],
} as const;

/** Marcas activas, ordenadas por nombre (las ordena el backend). */
export const useMarcas = () =>
  useQuery({
    queryKey: CLAVES_CATALOGO.marcas,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<MarcaPanel[]>(await api.GET('/api/catalogo/marcas')),
      ),
  });

/** Categorías raíz con sus subcategorías anidadas, ordenadas por nombre. */
export const useCategorias = () =>
  useQuery({
    queryKey: CLAVES_CATALOGO.categorias,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<CategoriaTienda[]>(await api.GET('/api/catalogo/categorias')),
      ),
  });
