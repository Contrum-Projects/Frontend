'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, apiPublica } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { ListadoTienda } from '@/compartido/api/respuestas';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { hrefDe, urlCatalogo } from '@/tienda/diseno/enlaces';
import {
  consultaProductos,
  type FiltrosProductos,
  type OrdenTienda,
} from './consultaFiltros';
import type { SeleccionFiltros } from './seleccionFiltros';
import { useTransicionFiltros } from './transicionFiltros';

/** Lo que se conserva al cambiar los filtros: la búsqueda y el orden. */
export interface ContextoFiltros {
  buscar?: string;
  orden?: OrdenTienda;
}

/**
 * Aplica una selección de filtros cambiando la URL: la página la vuelve a pedir en el servidor,
 * desde la primera página de resultados. `pendiente` dura hasta que llegan los resultados.
 */
export const useAplicarFiltros = ({ buscar, orden }: ContextoFiltros) => {
  const router = useRouter();
  const { pendiente, iniciar } = useTransicionFiltros();
  const aplicar = (
    seleccion: SeleccionFiltros,
    antes?: (seleccion: SeleccionFiltros) => void,
  ) =>
    iniciar(() => {
      antes?.(seleccion);
      router.push(
        hrefDe(
          urlCatalogo({
            q: buscar,
            categoria: seleccion.categoriaIds,
            marca: seleccion.marcaIds,
            orden,
          }),
        ),
        { scroll: false },
      );
    });
  return { aplicar, pendiente };
};

/**
 * Cuántos productos habría con la selección de los filtros del celular, antes de aplicarla
 * («Ver 10 productos»). Lo cuenta el backend (`limite=1`, se usa solo `total`). Se pide como
 * la grilla, para que el número coincida: sin sesión, salvo el profesional, que ve también los
 * exclusivos (SCRUM-109). La clave lleva su cuenta, como las demás lecturas profesionales.
 */
export const useTotalProductos = (
  filtros: Pick<FiltrosProductos, 'buscar' | 'categoriaIds' | 'marcaIds'>,
  habilitado: boolean,
) => {
  const { usuario } = useSesion();
  const profesional =
    usuario?.rol === ROLES.PROFESIONAL ? usuario.codigoPublico : '';
  return useQuery({
    queryKey: ['tienda', 'productos', 'total', profesional, filtros],
    queryFn: async () =>
      exigir<ListadoTienda>(
        await (profesional ? api : apiPublica).GET('/api/tienda/productos', {
          params: { query: consultaProductos({ ...filtros, limite: 1 }) },
        }),
      ).total,
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
};
