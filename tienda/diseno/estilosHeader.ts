/**
 * Clases compartidas por los enlaces y botones de la fila del header. Van en un módulo sin
 * `'use client'` para que el servidor (categorías) y el cliente (menús) reciban el texto.
 */
export const CLASE_ENLACE_HEADER =
  'inline-flex items-center gap-1 rounded-full px-3 py-2 whitespace-nowrap texto-etiqueta text-texto-principal transition-colors outline-none hover:bg-marca-acento-suave hover:text-marca-profundo focus-visible:ring-[3px] focus-visible:ring-ring/60 data-[state=open]:bg-marca-acento-suave data-[state=open]:text-marca-profundo';

/** Ícono redondo de 40 px (cuenta y carrito), con el mismo hover que los enlaces. */
export const CLASE_ICONO_HEADER =
  'relative inline-flex size-10 items-center justify-center rounded-full text-texto-principal transition-colors outline-none hover:bg-marca-acento-suave hover:text-marca-profundo focus-visible:ring-[3px] focus-visible:ring-ring/60';
