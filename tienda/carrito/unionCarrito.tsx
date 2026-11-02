'use client';

import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { CarritoUnido } from '@/compartido/api/respuestas';
import { leerEstado } from '@/compartido/sesion/almacen';
import {
  descontarDelCarritoNavegador,
  releerCarritoNavegador,
} from './carritoNavegador';
import { CLAVES_CARRITO, useCuentaCompradora } from './consultasCarrito';

/**
 * E5-H2, criterio 2. Va una vez en el layout de la tienda: cuando hay sesión de cliente o
 * profesional y el navegador tiene artículos, los envía a `POST /api/carrito/unir`, muestra el
 * carrito unido que devuelve el backend y los quita del navegador. El backend decide qué se
 * descarta o ajusta (RNF-03); el personal de tienda no tiene carrito y no une nada.
 *
 * Solo une cuando la sesión de esta pestaña empieza (al ingresar o al abrir la página con la
 * sesión viva), no cuando otra pestaña cambia el carrito del navegador: si en otra pestaña se
 * cerró la sesión y alguien agrega como visitante, eso no debe ir a esta cuenta.
 */
export const UnionCarrito = () => {
  const cuenta = useCuentaCompradora();
  const clienteConsultas = useQueryClient();

  useEffect(() => {
    if (cuenta === '') return;
    void unirUnaVez(cuenta, clienteConsultas);
  }, [cuenta, clienteConsultas]);

  return null;
};

let unionEnCurso: Promise<void> | null = null;

/** Una unión a la vez en la pestaña, y entre pestañas con Web Locks: no se suma dos veces. */
const unirUnaVez = (cuenta: string, clienteConsultas: QueryClient) => {
  unionEnCurso ??= conCandado(() => unir(cuenta, clienteConsultas)).finally(
    () => {
      unionEnCurso = null;
    },
  );
  return unionEnCurso;
};

const conCandado = (tarea: () => Promise<void>): Promise<void> =>
  typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('cp-unir-carrito', tarea)
    : tarea();

const sigueLaCuenta = (cuenta: string) => {
  const sesion = leerEstado();
  return sesion.tipo === 'activa' && sesion.usuario.codigoPublico === cuenta;
};

const unir = async (cuenta: string, clienteConsultas: QueryClient) => {
  // Otra pestaña pudo unirlo mientras se esperaba el candado
  const articulos = releerCarritoNavegador();
  if (articulos.length === 0 || !sigueLaCuenta(cuenta)) return;

  let unido: CarritoUnido;
  try {
    unido = exigir<CarritoUnido>(
      await api.POST('/api/carrito/unir', {
        body: { articulos: [...articulos] },
      }),
    );
  } catch {
    // No se pierde nada: sigue en el navegador y se vuelve a intentar en el próximo ingreso
    return;
  }
  descontarDelCarritoNavegador(articulos);

  // Si la sesión se cerró o cambió mientras tanto, el carrito no queda en la caché (RNF-30)
  if (!sigueLaCuenta(cuenta)) return;
  const { ajustes, ...carrito } = unido;
  // Un GET /api/carrito que salió antes de unir traería el carrito sin unir
  await clienteConsultas.cancelQueries({
    queryKey: CLAVES_CARRITO.carrito(cuenta),
    exact: true,
  });
  if (!sigueLaCuenta(cuenta)) return;
  clienteConsultas.setQueryData(CLAVES_CARRITO.carrito(cuenta), carrito);
  if (ajustes.length > 0) {
    // Hasta que la persona cambie su carrito o cierre sesión, aunque tarde en abrir /carrito
    clienteConsultas.setQueryDefaults(CLAVES_CARRITO.ajustes(cuenta), {
      gcTime: Infinity,
    });
    clienteConsultas.setQueryData(CLAVES_CARRITO.ajustes(cuenta), ajustes);
  }
};
