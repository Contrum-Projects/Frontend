'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  AjusteUnionCarrito,
  CarritoCuenta,
} from '@/compartido/api/respuestas';
import { leerEstado } from '@/compartido/sesion/almacen';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import type { ArticuloNavegador } from './carritoNavegador';

export { MAXIMO_UNIDADES_LINEA } from './carritoNavegador';

/**
 * Carrito de la cuenta (E5-H1). Es de la cuenta: solo se pide en el navegador, con la sesión
 * iniciada (RNF-30). La clave lleva la cuenta para no mostrar el carrito de otra si la sesión
 * cambia; cerrar sesión vacía la caché.
 *
 * Agregar, cambiar y quitar devuelven el carrito entero con los totales recalculados por el
 * backend: esa respuesta reemplaza la de la caché, sin calcular nada aquí (RNF-03).
 */
export const CLAVES_CARRITO = {
  carrito: (cuenta: string) => ['carrito', cuenta] as const,
  /** Lo que se ajustó al unir el carrito del navegador (E5-H2), hasta que cambie el carrito. */
  ajustes: (cuenta: string) => ['carrito', cuenta, 'ajustes'] as const,
  visitante: (articulos: readonly ArticuloNavegador[]) =>
    ['carrito', 'visitante', articulos] as const,
};

/** La cuenta compradora con sesión, o `''` (visitante o personal de tienda: no tienen carrito). */
export const useCuentaCompradora = (): string => {
  const { usuario } = useSesion();
  if (!usuario || esPersonal(usuario.rol)) return '';
  return usuario.codigoPublico;
};

export const useCarrito = () => {
  const cuenta = useCuentaCompradora();
  return useQuery({
    queryKey: CLAVES_CARRITO.carrito(cuenta),
    enabled: cuenta !== '',
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<CarritoCuenta>(await api.GET('/api/carrito')),
      ),
  });
};

/**
 * Guarda en la caché el carrito que devolvió el backend. Si la sesión se cerró o cambió de cuenta
 * mientras se guardaba, no lo deja en la caché (RNF-30).
 */
const useGuardarCarrito = () => {
  const cuenta = useCuentaCompradora();
  const clienteConsultas = useQueryClient();
  return (carrito: CarritoCuenta) => {
    const sesion = leerEstado();
    if (sesion.tipo !== 'activa' || sesion.usuario.codigoPublico !== cuenta) {
      return;
    }
    clienteConsultas.setQueryData(CLAVES_CARRITO.carrito(cuenta), carrito);
    // El aviso de la unión deja de valer cuando la persona ajusta su carrito
    clienteConsultas.removeQueries({
      queryKey: CLAVES_CARRITO.ajustes(cuenta),
    });
  };
};

export const useAgregarAlCarrito = () => {
  const guardar = useGuardarCarrito();
  return useMutation({
    mutationFn: (articulo: { articuloId: number; cantidad: number }) =>
      conErrorDeApi(async () =>
        exigir<CarritoCuenta>(
          await api.POST('/api/carrito/items', { body: articulo }),
        ),
      ),
    onSuccess: guardar,
  });
};

/** Cambiar la cantidad o quitar una línea. Una mutación por línea: sus controles esperan solos. */
export const useCambiarCantidad = (articuloId: number) => {
  const guardar = useGuardarCarrito();
  return useMutation({
    mutationFn: (cantidad: number) =>
      conErrorDeApi(async () =>
        exigir<CarritoCuenta>(
          await api.PATCH('/api/carrito/items/{articuloId}', {
            params: { path: { articuloId } },
            body: { cantidad },
          }),
        ),
      ),
    onSuccess: guardar,
  });
};

export const useQuitarDelCarrito = (articuloId: number) => {
  const guardar = useGuardarCarrito();
  return useMutation({
    mutationFn: () =>
      conErrorDeApi(async () =>
        exigir<CarritoCuenta>(
          await api.DELETE('/api/carrito/items/{articuloId}', {
            params: { path: { articuloId } },
          }),
        ),
      ),
    onSuccess: guardar,
  });
};

/** Unidades del carrito (suma de cantidades), para el título y el contador del header. */
export const contarUnidades = (carrito: CarritoCuenta): number =>
  carrito.items.reduce((suma, linea) => suma + linea.cantidad, 0);

/**
 * E5-H2 · El carrito del navegador con precios minoristas y si el stock cubre cada cantidad,
 * calculados por el backend sin guardar nada (`POST /api/carrito/cotizar`, pública). Mientras
 * cotiza un cambio, se sigue viendo la cotización anterior.
 */
export const useCotizacionVisitante = (
  articulos: readonly ArticuloNavegador[],
) =>
  useQuery({
    queryKey: CLAVES_CARRITO.visitante(articulos),
    enabled: articulos.length > 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      conErrorDeApi(async () =>
        // TODO(SCRUM-117): el Swagger no declara la respuesta (misma forma que GET /api/carrito)
        exigir<CarritoCuenta>(
          await api.POST('/api/carrito/cotizar', {
            body: { articulos: [...articulos] },
          }),
        ),
      ),
  });

/** E5-H2 · Lo que se quitó o ajustó al unir; lo deja <UnionCarrito> y no se pide a la API. */
export const useAjustesUnion = (): AjusteUnionCarrito[] => {
  const cuenta = useCuentaCompradora();
  const { data } = useQuery<AjusteUnionCarrito[]>({
    queryKey: CLAVES_CARRITO.ajustes(cuenta),
    queryFn: () => [],
    enabled: false,
    staleTime: Infinity,
  });
  return data ?? [];
};
