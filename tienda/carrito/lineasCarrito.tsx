'use client';

import type { LineaCarrito as Linea } from '@/compartido/api/respuestas';
import {
  cambiarCantidadNavegador,
  quitarDelCarritoNavegador,
} from './carritoNavegador';
import { useCambiarCantidad, useQuitarDelCarrito } from './consultasCarrito';
import { LineaCarrito, type LineaCarritoProps } from './lineaCarrito';

/** Línea del carrito de la cuenta: cada cambio va al backend y vuelve el carrito entero. */
export function LineaCuenta({
  linea,
  profesional,
  compacta,
}: LineaCarritoProps) {
  const cambiar = useCambiarCantidad(linea.articuloId);
  const quitar = useQuitarDelCarrito(linea.articuloId);
  return (
    <LineaCarrito
      linea={linea}
      profesional={profesional}
      compacta={compacta}
      acciones={{
        cantidad: cambiar.isPending ? cambiar.variables : linea.cantidad,
        ocupada: cambiar.isPending || quitar.isPending,
        error: cambiar.error ?? quitar.error,
        onCambiar: (valor) => cambiar.mutate(valor),
        onQuitar: () => quitar.mutate(),
      }}
    />
  );
}

/**
 * E5-H2 · Línea del carrito del navegador: el cambio se guarda al tiro en el navegador y el
 * backend vuelve a cotizar. La cantidad que se muestra es la guardada, no la de la cotización.
 */
export const LineaVisitante = ({
  linea,
  cantidad,
  ocupada,
  compacta,
}: {
  linea: Linea;
  cantidad: number;
  /** Mientras el backend cotiza el último cambio (también frena clics de más a `cotizar`). */
  ocupada: boolean;
  compacta?: boolean;
}) => (
  <LineaCarrito
    linea={linea}
    profesional={false}
    compacta={compacta}
    acciones={{
      cantidad,
      ocupada,
      error: null,
      onCambiar: (valor) => cambiarCantidadNavegador(linea.articuloId, valor),
      onQuitar: () => quitarDelCarritoNavegador(linea.articuloId),
    }}
  />
);
