'use client';

import { useState } from 'react';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { useCuentaCompradora } from '@/tienda/carrito/consultasCarrito';
import { useDirecciones } from '@/tienda/cuenta/consultasCuenta';
import {
  useCotizacionDespacho,
  type EleccionCheckout,
} from './consultasCheckout';

export type TipoEntrega = 'retiro' | 'despacho';

/**
 * E7-H1 · Cómo recibe el pedido el comprador. Parte con retiro en tienda: así no se cotiza con
 * Chilexpress hasta que elige despacho. Con despacho usa la dirección que eligió o, si no eligió,
 * la principal de la cuenta, y la cotiza.
 */
export const useEntrega = () => {
  const [tipo, setTipo] = useState<TipoEntrega>('retiro');
  const [idElegida, setIdElegida] = useState<number | null>(null);
  // El personal de tienda no compra: no se le piden direcciones
  const direcciones = useDirecciones({
    activa: useCuentaCompradora() !== '',
  });
  const lista = direcciones.data ?? [];
  const direccion: DireccionCuenta | null =
    lista.find((d) => d.id === idElegida) ??
    lista.find((d) => d.esPrincipal) ??
    lista[0] ??
    null;
  const conDespacho = tipo === 'despacho';
  const cotizacion = useCotizacionDespacho(
    conDespacho ? (direccion?.id ?? null) : null,
  );
  // Despacho sin dirección no se envía: nunca se cambia a retiro sin avisar
  const eleccion: EleccionCheckout | null = !conDespacho
    ? { tipoEntrega: 'retiro', tipoDocumento: 'boleta' }
    : direccion
      ? {
          tipoEntrega: 'despacho',
          direccionId: direccion.id,
          tipoDocumento: 'boleta',
        }
      : null;

  return {
    tipo,
    cambiarTipo: setTipo,
    direcciones,
    direccion,
    elegirDireccion: setIdElegida,
    cotizacion,
    /** Lo que se envía al crear el pedido; `null` con despacho y sin dirección. */
    eleccion,
    /** Con despacho se paga solo con la dirección cotizada: el total depende del envío. */
    listaParaPagar: eleccion !== null && (!conDespacho || cotizacion.isSuccess),
  };
};

export type Entrega = ReturnType<typeof useEntrega>;
