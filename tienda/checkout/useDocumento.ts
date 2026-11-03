'use client';

import { useState } from 'react';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { useDatosFacturacion } from '@/tienda/cuenta/consultasCuenta';
import type { EleccionDocumento } from './consultasCheckout';

/**
 * E9-H1 · El documento del pedido. Parte con el comprobante electrónico de pago (boleta). Con
 * «Necesito factura» pide los datos de facturación de la cuenta y usa los que eligió el
 * comprador o, si no eligió, los primeros de la lista (el orden del backend).
 */
export const useDocumento = () => {
  const [conFactura, setConFactura] = useState(false);
  const [idElegido, setIdElegido] = useState<number | null>(null);
  const datos = useDatosFacturacion({ activa: conFactura });
  const lista = datos.data ?? [];
  // Si los que eligió desaparecen (se eliminaron en otra pestaña), no se pasa en silencio a otros:
  // la factura saldría con otro RUT. Queda sin elegir hasta que vuelva a marcar unos.
  const elegidos: DatosFacturacionCuenta | null =
    idElegido === null
      ? (lista[0] ?? null)
      : (lista.find((registro) => registro.id === idElegido) ?? null);

  // Factura sin datos no se envía: el backend respondería 409 (criterio 3)
  const eleccion: EleccionDocumento | null = !conFactura
    ? { tipoDocumento: 'boleta' }
    : elegidos
      ? { tipoDocumento: 'factura', datosFacturacionId: elegidos.id }
      : null;

  return {
    conFactura,
    cambiarConFactura: setConFactura,
    datos,
    elegidos,
    elegir: setIdElegido,
    /** Lo que se envía al crear el pedido; `null` con factura y sin datos elegidos. */
    eleccion,
  };
};

export type Documento = ReturnType<typeof useDocumento>;
