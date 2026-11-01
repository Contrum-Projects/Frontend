'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

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
};

/** Tope técnico del backend por artículo (`MAXIMO_UNIDADES_LINEA`); el stock lo revisa él. */
export const MAXIMO_UNIDADES_LINEA = 999;

/** La cuenta compradora con sesión, o `''` (visitante o personal de tienda: no tienen carrito). */
const useCuentaCompradora = (): string => {
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

/** Guarda en la caché el carrito que devolvió el backend. */
const useGuardarCarrito = () => {
  const cuenta = useCuentaCompradora();
  const clienteConsultas = useQueryClient();
  return (carrito: CarritoCuenta) =>
    clienteConsultas.setQueryData(CLAVES_CARRITO.carrito(cuenta), carrito);
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
