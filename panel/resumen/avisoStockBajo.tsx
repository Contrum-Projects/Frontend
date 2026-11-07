'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FormatoBajoMinimo } from '@/compartido/api/respuestas';
import { FormatosBajoMinimo } from '@/panel/inventario/formatosBajoMinimo';
import { ENLACE_TARJETA, TARJETA } from './estilosResumen';

const RUTA_INVENTARIO: Route = '/panel/inventario';

/** El resumen muestra los que más faltan; el indicador dice cuántos son en total. */
export const MAXIMO_FILAS_STOCK = 5;

const TITULO = 'Stock bajo el mínimo';

/**
 * «Stock bajo el mínimo» del Resumen (E11-H6 criterio 1, Figma P1 2028:470 y celular): los
 * formatos que más faltan con su stock y mínimo, y el enlace al inventario.
 */
export const TarjetaStockBajo = ({
  formatos,
}: {
  formatos: FormatoBajoMinimo[];
}) => (
  <section aria-labelledby="titulo-stock-bajo" className={TARJETA}>
    <div className="flex items-center justify-between gap-3">
      <h2
        id="titulo-stock-bajo"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        {TITULO}
      </h2>
      <Link href={RUTA_INVENTARIO} className={ENLACE_TARJETA}>
        <span className="max-lg:hidden">Ver inventario</span>
        <span className="lg:hidden">Ver todo</span>
      </Link>
    </div>
    <FormatosBajoMinimo
      filas={formatos.slice(0, MAXIMO_FILAS_STOCK)}
      etiqueta={TITULO}
    />
  </section>
);
