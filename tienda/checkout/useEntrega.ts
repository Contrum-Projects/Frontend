'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorDeApi } from '@/compartido/api/errores';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { useCuentaCompradora } from '@/tienda/carrito/consultasCarrito';
import {
  consultaMisDatos,
  useDirecciones,
} from '@/tienda/cuenta/consultasCuenta';
import {
  useCotizacionDespacho,
  type EleccionEntrega,
} from './consultasCheckout';

export type TipoEntrega = 'retiro' | 'despacho';

/**
 * E7-H2, criterio 2 · Respuestas con las que el backend no cotiza y ofrece el retiro: 409 (sin
 * cobertura de Chilexpress para esa comuna y bulto) y 503 (Chilexpress no responde).
 */
const SIN_COTIZACION = [409, 503];

/**
 * E7-H1 · Cómo recibe el pedido el comprador. Parte con retiro en tienda: así no se cotiza con
 * Chilexpress hasta que elige despacho. Con despacho usa la dirección que eligió o, si no eligió,
 * la principal de la cuenta, y la cotiza.
 */
export const useEntrega = (codigoCupon: string | null = null) => {
  const [tipo, setTipo] = useState<TipoEntrega>('retiro');
  const [idElegida, setIdElegida] = useState<number | null>(null);
  // SCRUM-167 · `null` mientras no lo cambia: se muestra el de la cuenta
  const [telefonoEscrito, setTelefonoEscrito] = useState<string | null>(null);
  // El personal de tienda no compra: no se le piden direcciones ni sus datos
  const compradora = useCuentaCompradora() !== '';
  const direcciones = useDirecciones({ activa: compradora });
  const misDatos = useQuery({ ...consultaMisDatos, enabled: compradora });
  const telefono = telefonoEscrito ?? misDatos.data?.telefono ?? '';
  const telefonoContacto = telefono.trim();
  const lista = direcciones.data ?? [];
  const direccion: DireccionCuenta | null =
    lista.find((d) => d.id === idElegida) ??
    lista.find((d) => d.esPrincipal) ??
    lista[0] ??
    null;
  const conDespacho = tipo === 'despacho';
  const cotizacion = useCotizacionDespacho(
    conDespacho ? (direccion?.id ?? null) : null,
    codigoCupon,
  );
  // Despacho sin dirección no se envía: nunca se cambia a retiro sin avisar
  const eleccion: EleccionEntrega | null = !conDespacho
    ? { tipoEntrega: 'retiro' }
    : direccion
      ? {
          tipoEntrega: 'despacho',
          direccionId: direccion.id,
          // Vacío no se envía: el backend usa el de la cuenta o pide escribirlo
          ...(telefonoContacto && { telefonoContacto }),
        }
      : null;

  return {
    tipo,
    cambiarTipo: setTipo,
    direcciones,
    direccion,
    elegirDireccion: setIdElegida,
    /** El teléfono de quien recibe el despacho (SCRUM-167): el de la cuenta hasta que lo cambia. */
    telefono,
    cambiarTelefono: setTelefonoEscrito,
    cotizacion,
    /** El despacho no se pudo cotizar y el backend ofrece el retiro en tienda (E7-H2). */
    ofreceRetiro:
      conDespacho &&
      cotizacion.error instanceof ErrorDeApi &&
      SIN_COTIZACION.includes(cotizacion.error.estado),
    /** Lo que se envía al crear el pedido; `null` con despacho y sin dirección. */
    eleccion,
    /** Con despacho se paga solo con la dirección cotizada: el total depende del envío. */
    listaParaPagar: eleccion !== null && (!conDespacho || cotizacion.isSuccess),
  };
};

export type Entrega = ReturnType<typeof useEntrega>;
