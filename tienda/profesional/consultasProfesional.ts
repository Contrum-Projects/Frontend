'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  ListadoTiendaProfesional,
  PackDetalleProfesional,
  ProductoDetalleProfesional,
} from '@/compartido/api/respuestas';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import {
  consultaProductos,
  type FiltrosProductos,
} from '@/tienda/catalogo/consultaFiltros';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/**
 * Lecturas de la tienda con la sesión del profesional (E2-H4). El servidor arma la tienda como
 * visitante (SEO, RNF-04); con una cuenta profesional, el navegador vuelve a pedir lo mismo con
 * su token y el backend agrega los exclusivos y el precio mayorista. Ingresar o cerrar sesión
 * vacía la caché, y además cada clave lleva la cuenta: si la sesión cambia de cuenta al renovarse
 * (otra pestaña), no se reutiliza lo que se pidió con la anterior.
 */
export const CLAVES_PROFESIONAL = {
  producto: (cuenta: string, id: number) =>
    ['tienda', 'profesional', cuenta, 'producto', id] as const,
  pack: (cuenta: string, id: number) =>
    ['tienda', 'profesional', cuenta, 'pack', id] as const,
  productos: (cuenta: string, filtros: FiltrosProductos, paginas: number) =>
    ['tienda', 'profesional', cuenta, 'productos', filtros, paginas] as const,
};

/** Solo decide qué se muestra: el precio que corresponde lo decide el backend (RNF-03). */
export const useEsProfesional = (): boolean =>
  useSesion().usuario?.rol === ROLES.PROFESIONAL;

/** La cuenta profesional que mira, o `''` si no lo es (y entonces no se pide nada). */
const useCuentaProfesional = (): string => {
  const { usuario } = useSesion();
  return usuario?.rol === ROLES.PROFESIONAL ? usuario.codigoPublico : '';
};

/**
 * `null` si el backend responde 404 también para el profesional. Solo pide con una cuenta
 * profesional y si `activa` (sin un id válido, no se pide).
 */
export const useProductoProfesional = (id: number, activa = true) => {
  const cuenta = useCuentaProfesional();
  return useQuery({
    queryKey: CLAVES_PROFESIONAL.producto(cuenta, id),
    enabled: cuenta !== '' && activa,
    queryFn: () =>
      conErrorDeApi(async () => {
        const resultado = await api.GET('/api/tienda/productos/{id}', {
          params: { path: { id } },
        });
        if (resultado.response.status === 404) return null;
        return exigir<ProductoDetalleProfesional>(resultado);
      }),
  });
};

export const usePackProfesional = (id: number, activa = true) => {
  const cuenta = useCuentaProfesional();
  return useQuery({
    queryKey: CLAVES_PROFESIONAL.pack(cuenta, id),
    enabled: cuenta !== '' && activa,
    queryFn: () =>
      conErrorDeApi(async () => {
        const resultado = await api.GET('/api/tienda/packs/{id}', {
          params: { path: { id } },
        });
        if (resultado.response.status === 404) return null;
        return exigir<PackDetalleProfesional>(resultado);
      }),
  });
};

/**
 * Las páginas 1 a `paginas` en paralelo y unidas, como `leerPaginas` del catálogo, para que
 * «Cargar más» siga siendo un enlace.
 */
export const useProductosProfesional = (
  filtros: FiltrosProductos,
  paginas = 1,
) => {
  const cuenta = useCuentaProfesional();
  return useQuery({
    queryKey: CLAVES_PROFESIONAL.productos(cuenta, filtros, paginas),
    enabled: cuenta !== '',
    queryFn: () =>
      conErrorDeApi(async () => {
        const listados = await Promise.all(
          Array.from({ length: paginas }, async (_, i) =>
            exigir<ListadoTiendaProfesional>(
              await api.GET('/api/tienda/productos', {
                params: {
                  query: consultaProductos({ ...filtros, pagina: i + 1 }),
                },
              }),
            ),
          ),
        );
        return {
          ...listados[0],
          items: listados.flatMap((listado) => listado.items),
        };
      }),
  });
};
